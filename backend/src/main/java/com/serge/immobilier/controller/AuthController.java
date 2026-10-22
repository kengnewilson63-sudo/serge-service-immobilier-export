package com.serge.immobilier.controller;

import com.serge.immobilier.auth.AuthResponse;
import com.serge.immobilier.auth.LoginRequest;
import com.serge.immobilier.auth.PasswordResetConfirm;
import com.serge.immobilier.auth.PasswordResetMailer;
import com.serge.immobilier.auth.PasswordResetRequest;
import com.serge.immobilier.auth.PasswordResetService;
import com.serge.immobilier.auth.RegisterRequest;
import com.serge.immobilier.auth.UserSummary;
import com.serge.immobilier.model.Role;
import com.serge.immobilier.model.UserEntity;
import com.serge.immobilier.repository.UserRepository;
import com.serge.immobilier.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;
    private final PasswordResetMailer passwordResetMailer;

    @org.springframework.beans.factory.annotation.Value("${app.registration.enabled:false}")
    private boolean registrationEnabled;

    /** Code d'activation d'un accès, défini dans backend/.env (SETUP_CODE). */
    @org.springframework.beans.factory.annotation.Value("${app.setup-code:}")
    private String setupCode;

    /** Administrateur : connecté ET rôle ADMIN (l'espace /admin est réservé à l'agence). */
    @PostMapping("/link")
    public ResponseEntity<AuthResponse> link(@Valid @RequestBody LoginRequest request) {
        // Permet d'entrer dans l'espace agence sans connaître le mot de passe admin :
        // on prouve son identité avec son e-mail + le code d'activation de l'agence.
        if (setupCode == null || setupCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "L'accès par code n'est pas activé sur ce serveur. Connectez-vous par e-mail.");
        }
        String code = request.password().trim();
        if (!code.equals(setupCode.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code d'accès incorrect.");
        }
        UserEntity user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Aucun compte avec cet e-mail. Demandez à l'agence de créer votre accès."));
        // L'accès par code ouvre l'espace agence : le compte doit être ADMIN, sauf si aucun
        // administrateur n'existe encore (installation neuve) — le premier arrivé devient ADMIN.
        if (user.getRole() != Role.ADMIN) {
            if (userRepository.countByRole(Role.ADMIN) == 0) {
                user.setRole(Role.ADMIN);
                userRepository.save(user);
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Ce compte n'a pas les droits de l'agence.");
            }
        }
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .build();
        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(userDetails), toSummary(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication;
        try {
            // Les e-mails sont enregistrés en minuscules : sans ce nettoyage, un « Admin@… »
            // (souvent ajouté automatiquement par le téléphone) renvoyait une erreur.
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            // Un 401 est renvoyé au navigateur ; les intercepteurs HTTP (proxy, antivirus,
            // hébergeur) le remplacent parfois par un 403 « Request failed (403) ».
            // On répond donc 400 avec un message clair : la page de connexion l'affiche tel quel.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "E-mail ou mot de passe incorrect.");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserEntity user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        String token = jwtService.generateToken(userDetails);
        return ResponseEntity.ok(new AuthResponse(token, toSummary(user)));
    }

    /**
     * Inscription publique. Le compte est créé avec le rôle USER : il ne peut PAS
     * publier d'annonce. Seul l'administrateur (ADMIN_PASSWORD au démarrage, ou
     * /api/admin/users/{id}/role) peut promouvoir quelqu'un en ADMIN.
     * Avant, le rôle ADMIN était codé en dur ici : n'importe quel visiteur pouvait
     * créer un compte et publier dans le catalogue.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (!registrationEnabled) {
            // 400 et non 403 : certains proxys affichent un 403 comme « accès refusé »,
            // alors qu'ici c'est simplement un réglage de l'agence.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La création de compte est désactivée. Contactez l'agence pour obtenir un accès.");
        }
        String email = request.email().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("Un compte existe déjà avec cet e-mail.");
        }

        UserEntity user = new UserEntity();
        user.setFullName(request.fullName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        userRepository.save(user);

        String token = jwtService.generateToken(org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .build());

        return ResponseEntity.ok(new AuthResponse(token, toSummary(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserSummary> me() {
        org.springframework.security.core.Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expirée : reconnectez-vous.");
        }
        String email = authentication.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return ResponseEntity.ok(toSummary(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

        /**
     * Demande de réinitialisation. Répond toujours 200 avec le même message, que le
     * compte existe ou non (pour ne pas révéler les e-mails enregistrés). Le lien est
     * envoyé par e-mail dès qu'un SMTP est configuré ; sinon, et uniquement en mode
     * développement, il est renvoyé dans `devResetUrl`.
     */
    @PostMapping("/password-reset-request")
    public ResponseEntity<Map<String, String>> passwordResetRequest(@Valid @RequestBody PasswordResetRequest request) {
        Map<String, String> response = new java.util.LinkedHashMap<>();
        response.put("message", "Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.");
        passwordResetService.createToken(request.email())
                .flatMap(token -> java.util.Optional.ofNullable(
                        passwordResetMailer.send(request.email().trim().toLowerCase(), token)))
                .ifPresent(devResetUrl -> response.put("devResetUrl", devResetUrl));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password-reset")
    public ResponseEntity<Map<String, String>> passwordReset(@Valid @RequestBody PasswordResetConfirm request) {
        passwordResetService.resetPassword(request.resetToken(), request.newPassword());
        return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour. Vous pouvez vous connecter."));
    }

    private UserSummary toSummary(UserEntity user) {
        return new UserSummary(user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
    }
}

package com.serge.immobilier.controller;

import com.serge.immobilier.auth.UserSummary;
import com.serge.immobilier.model.Role;
import com.serge.immobilier.model.UserEntity;
import com.serge.immobilier.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Gestion des accès à l'espace /admin. Réservé aux ADMINISTRATEURS.
 * <p>
 * Permet de créer directement un compte éditeur et de changer son rôle, sans
 * passer par une requête SQL. Le dernier ADMIN ne peut pas être rétrogradé
 * (sinon plus personne ne pourrait publier).
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public record NewUser(String fullName, String email, String password, String role) {}

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<UserSummary> list() {
        return userRepository.findAll().stream()
                .map(u -> new UserSummary(u.getId(), u.getEmail(), u.getFullName(), u.getRole().name()))
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public UserSummary create(@RequestBody NewUser body) {
        if (body.email() == null || body.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'e-mail est obligatoire.");
        }
        if (body.password() == null || body.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe doit faire au moins 8 caractères.");
        }
        String email = body.email().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet e-mail.");
        }

        Role role = "ADMIN".equalsIgnoreCase(body.role()) ? Role.ADMIN : Role.USER;
        UserEntity user = new UserEntity();
        user.setFullName(body.fullName() == null || body.fullName().isBlank() ? email : body.fullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(body.password()));
        user.setRole(role);
        UserEntity saved = userRepository.save(user);
        return new UserSummary(saved.getId(), saved.getEmail(), saved.getFullName(), saved.getRole().name());
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public UserSummary changeRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Compte introuvable."));
        Role role;
        try {
            role = Role.valueOf(String.valueOf(body.get("role")).trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle invalide : ADMIN ou USER attendu.");
        }
        if (user.getRole() == Role.ADMIN && role != Role.ADMIN) {
            long admins = userRepository.countByRole(Role.ADMIN);
            if (admins <= 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Impossible de rétrograder le dernier administrateur.");
            }
        }
        user.setRole(role);
        UserEntity saved = userRepository.save(user);
        return new UserSummary(saved.getId(), saved.getEmail(), saved.getFullName(), saved.getRole().name());
    }
}

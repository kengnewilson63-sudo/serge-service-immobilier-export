package com.serge.immobilier.auth;

import com.serge.immobilier.model.PasswordResetToken;
import com.serge.immobilier.model.UserEntity;
import com.serge.immobilier.repository.PasswordResetTokenRepository;
import com.serge.immobilier.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    /** Durée de validité d'un lien de réinitialisation. */
    private static final Duration TTL = Duration.ofMinutes(30);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    /**
     * Crée un jeton pour cet e-mail. Renvoie un Optional vide si le compte
     * n'existe pas : l'appelant répond toujours 200 pour ne pas révéler quels
     * e-mails sont enregistrés.
     */
    @Transactional
    public Optional<String> createToken(String email) {
        Optional<UserEntity> user = userRepository.findByEmail(email.trim().toLowerCase());
        if (user.isEmpty()) {
            return Optional.empty();
        }

        tokenRepository.deleteByUser_Id(user.get().getId());

        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String rawToken = HexFormat.of().formatHex(bytes);

        PasswordResetToken token = new PasswordResetToken();
        token.setTokenHash(hash(rawToken));
        token.setUser(user.get());
        token.setExpiresAt(Instant.now().plus(TTL));
        tokenRepository.save(token);

        return Optional.of(rawToken);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Jeton de réinitialisation manquant.");
        }
        PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Lien de réinitialisation invalide."));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            tokenRepository.delete(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ce lien a expiré. Demandez-en un nouveau.");
        }

        UserEntity user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(token);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponible", e);
        }
    }
}

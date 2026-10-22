package com.serge.immobilier.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Jeton à usage unique pour réinitialiser un mot de passe. Seul le hachage du
 * jeton est stocké : un accès en lecture à la base ne permet pas de le réutiliser.
 */
@Entity
@Table(name = "password_reset_tokens", indexes = {
    @Index(name = "idx_password_reset_token_hash", columnList = "tokenHash", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}

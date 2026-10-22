package com.serge.immobilier.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Nouveau mot de passe + jeton reçu par e-mail. */
public record PasswordResetConfirm(
        @NotBlank String resetToken,
        @NotBlank @Size(min = 6, message = "au moins 6 caractères") String newPassword
) {
}

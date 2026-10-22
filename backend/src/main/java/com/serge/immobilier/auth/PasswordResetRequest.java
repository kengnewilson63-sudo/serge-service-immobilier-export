package com.serge.immobilier.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Demande d'envoi d'un lien de réinitialisation. */
public record PasswordResetRequest(@Email @NotBlank String email) {
}

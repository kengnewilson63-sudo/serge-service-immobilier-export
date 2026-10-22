package com.serge.immobilier.auth;

public record AuthResponse(String token, UserSummary user) {
}

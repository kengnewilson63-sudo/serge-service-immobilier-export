package com.serge.immobilier.controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Renvoie toujours un corps JSON { "message": "..." } : le frontend affiche
 * cette valeur, faute de quoi l'utilisateur ne voit qu'un échec silencieux.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("message", ex.getReason() == null ? "Requête refusée" : ex.getReason()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + " : " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest()
                .body(Map.of("message", message.isBlank() ? "Données de l'annonce invalides" : message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Le contenu envoyé au serveur est invalide."));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Une annonce avec les mêmes informations existe déjà (slug en double)."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Seul un administrateur peut publier ou modifier une annonce."));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuth(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Session expirée : reconnectez-vous puis réessayez."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", ex.getMessage() == null ? "Requête invalide" : ex.getMessage()));
    }

    /** Conflit métier (e-mail déjà utilisé, etc.). */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", ex.getMessage() == null ? "Opération impossible" : ex.getMessage()));
    }

    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleTooLarge(
            org.springframework.web.multipart.MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(Map.of("message", "Photo trop lourde (10 Mo maximum)."));
    }

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(
            org.springframework.web.servlet.resource.NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Ressource introuvable"));
    }
}

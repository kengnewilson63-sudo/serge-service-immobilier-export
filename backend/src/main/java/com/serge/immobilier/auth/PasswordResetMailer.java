package com.serge.immobilier.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Envoi du lien de réinitialisation par e-mail.
 * <p>
 * Si `spring.mail.host` n'est pas configuré (aucun SMTP), aucun e-mail n'est
 * envoyé et le lien n'est affiché dans l'interface qu'en mode développement
 * (`app.mail.expose-reset-link=true`). En production, configurez SMTP_USERNAME /
 * SMTP_PASSWORD : le lien part alors uniquement par e-mail.
 */
@Service
@Slf4j
public class PasswordResetMailer {

    private final JavaMailSender mailSender;
    private final String from;
    private final String publicUrl;
    private final String appName;
    private final boolean exposeLink;

    public PasswordResetMailer(
            JavaMailSender mailSender,
            @Value("${app.mail.from:no-reply@sergeserviceimmo.cm}") String from,
            @Value("${app.public-url:http://localhost:8080}") String publicUrl,
            @Value("${app.name:Serge Service Immobilier}") String appName,
            @Value("${app.mail.expose-reset-link:true}") boolean exposeLink) {
        this.mailSender = mailSender;
        this.from = from;
        this.publicUrl = publicUrl.replaceAll("/+$", "");
        this.appName = appName;
        this.exposeLink = exposeLink;
    }

    /** true si la configuration permet réellement d'envoyer un e-mail. */
    public boolean isConfigured() {
        return mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl impl
                && impl.getHost() != null
                && !impl.getHost().isBlank();
    }

    /**
     * @return le lien si l'interface doit l'afficher (mode développement), sinon null.
     */
    public String send(String to, String rawToken) {
        String link = publicUrl + "/reset-password?token=" + rawToken;

        if (!isConfigured()) {
            log.warn("SMTP non configuré : lien de réinitialisation pour {} NON envoyé par e-mail.", to);
            return exposeLink ? "/reset-password?token=" + rawToken : null;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(appName + " — réinitialisation de votre mot de passe");
        message.setText("""
                Bonjour,

                Vous avez demandé à réinitialiser votre mot de passe sur %s.

                Cliquez sur ce lien (valable 30 minutes) :
                %s

                Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.

                %s
                """.formatted(appName, link, appName));

        try {
            mailSender.send(message);
        } catch (MailException e) {
            log.error("Échec de l'envoi de l'e-mail de réinitialisation à {} : {}", to, e.getMessage());
        }
        return null;
    }
}

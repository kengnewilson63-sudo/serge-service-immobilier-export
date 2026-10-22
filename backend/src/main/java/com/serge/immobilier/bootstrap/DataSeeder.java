package com.serge.immobilier.bootstrap;

import com.serge.immobilier.model.PropertyEntity;
import com.serge.immobilier.model.Role;
import com.serge.immobilier.model.UserEntity;
import com.serge.immobilier.repository.PropertyRepository;
import com.serge.immobilier.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@serge-immobilier.com}")
    private String adminEmail;

    /**
     * Aucune valeur par défaut : l'administrateur n'est créé que si ADMIN_PASSWORD est
     * défini (dans backend/.env ou dans les variables du serveur). On ne code plus de
     * mot de passe en dur dans le code source.
     */
    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.registration.enabled:false}")
    private boolean registrationEnabled;

    /** Mot de passe de développement, créé uniquement si ADMIN_PASSWORD est absent en local. */
    private static final String DEFAULT_DEV_PASSWORD = "changez-ce-mot-de-passe";

    private boolean isLocalDevelopment() {
        String url = System.getenv("DB_URL");
        if (url == null || url.contains("localhost") || url.contains("127.0.0.1")) {
            return true;
        }
        // Render, Railway, Fly.io… : un serveur en ligne n'est jamais « local », même
        // si le contexte Spring actif n'indique pas encore le profil de production.
        String render = System.getenv("RENDER");
        return render == null || render.isBlank();
    }

    /** Vrai si le compte administrateur existe déjà (l'agence est en place). */
    private boolean organizationExists() {
        return userRepository.countByRole(Role.ADMIN) > 0;
    }

    @Override
    public void run(String... args) {
        // ADMIN_PASSWORD ne sert qu'à la CRÉATION du compte lorsque l'agence n'a encore
        // aucun administrateur. S'il en existe un, c'est son mot de passe qui fait foi :
        // un ADMIN_PASSWORD oublié ou par défaut ne doit jamais écraser le vrai mot de passe.
        String password = adminPassword;
        boolean adminExists = organizationExists()
                || userRepository.findByEmail(adminEmail.trim().toLowerCase()).isPresent();
        if (password == null || password.isBlank()) {
            if (!adminExists) {
                if (isLocalDevelopment()) {
                    password = DEFAULT_DEV_PASSWORD;
                    org.slf4j.LoggerFactory.getLogger(DataSeeder.class).warn(
                            "ADMIN_PASSWORD non défini : compte de développement {} / {} (local uniquement)",
                            adminEmail, DEFAULT_DEV_PASSWORD);
                } else {
                    org.slf4j.LoggerFactory.getLogger(DataSeeder.class).warn(
                            "Aucun compte administrateur : définissez ADMIN_PASSWORD (au moins 8 caractères) dans les variables d'environnement du serveur");
                }
            }
        }
        // Création seulement si aucun administrateur n'existe. Avant, la condition testait
        // « aucun ADMIN dans toute la base » : un administrateur créé par /api/admin/users
        // puis supprimé laissait un compte ADMIN_EMAIL orphelin, et ADMIN_PASSWORD ne
        // recréait plus rien à cause du doublon d'e-mail (compte inaccessible).
        if (password != null && !password.isBlank() && !adminExists) {
            UserEntity user = new UserEntity();
            user.setFullName("Serge Service Immobilier");
            user.setEmail(adminEmail.trim().toLowerCase());
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(Role.ADMIN);
            userRepository.save(user);
        } else {
            // Compte existant : on s'assure qu'il est bien ADMIN (ancien compte créé
            // par l'inscription publique à l'époque où le rôle ADMIN était forcé).
            userRepository.findByEmail(adminEmail.trim().toLowerCase()).ifPresent(user -> {
                if (user.getRole() != Role.ADMIN) {
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                }
            });
        }

        if (registrationEnabled) {
            org.slf4j.LoggerFactory.getLogger(DataSeeder.class).warn(
                    "Inscription publique ACTIVÉE : tout visiteur peut créer un compte (rôle USER, sans droit de publication).");
        }

        if (propertyRepository.count() == 0) {
            PropertyEntity p1 = new PropertyEntity();
            p1.setSlug("studio-makepe-douala");
            p1.setTitle("Studio 1 chambre à Makepe");
            p1.setType("Appartement");
            p1.setTransaction("location");
            p1.setStatus("disponible");
            p1.setFeatured(true);
            p1.setRegion("Littoral");
            p1.setCity("Douala");
            p1.setNeighborhood("Makepe");
            p1.setPrice(new BigDecimal("180000"));
            p1.setTerms("Loyer mensuel");
            p1.setRooms(1);
            p1.setBathrooms(1);
            p1.setArea(35);
            p1.setContact("+237680000001");
            p1.setDescription("Studio lumineux et bien situé à proximité des commerces et du centre-ville.");
            p1.setFeatures(List.of("Climatisation", "Parking", "Sécurité 24/7"));
            p1.setImages(List.of("https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop"));
            p1.setPosition(1);

            PropertyEntity p2 = new PropertyEntity();
            p2.setSlug("villa-logpom-douala");
            p2.setTitle("Villa 4 chambres à Logpom");
            p2.setType("Maison");
            p2.setTransaction("vente");
            p2.setStatus("disponible");
            p2.setFeatured(true);
            p2.setRegion("Littoral");
            p2.setCity("Douala");
            p2.setNeighborhood("Logpom");
            p2.setPrice(new BigDecimal("98000000"));
            p2.setTerms("Prix de vente");
            p2.setRooms(4);
            p2.setBathrooms(3);
            p2.setArea(220);
            p2.setContact("+237680000002");
            p2.setDescription("Grande villa familiale avec jardin et accès sécurisé.");
            p2.setFeatures(List.of("Jardin", "Piscine", "Garage"));
            p2.setImages(List.of("https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop"));
            p2.setPosition(2);

            propertyRepository.saveAll(List.of(p1, p2));
        }
    }
}

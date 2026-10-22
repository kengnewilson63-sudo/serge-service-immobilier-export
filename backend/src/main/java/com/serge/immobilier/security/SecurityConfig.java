package com.serge.immobilier.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /** Origines CORS en plus de la liste par défaut (variable ALLOWED_ORIGINS). */
    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Une requête non authentifiée reçoit 401 (et non 403), avec les
                        // en-têtes CORS : le site peut alors retirer le jeton expiré.
                        .requestMatchers("/error").permitAll()
                        // GET sur /api/properties est public, mais POST/PUT/DELETE exigent un administrateur
                        // (vérifié par @PreAuthorize dans PropertyController).
                        .requestMatchers(HttpMethod.GET, "/api/properties", "/api/properties/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/link", "/api/auth/register",
                                "/api/auth/password-reset-request", "/api/auth/password-reset").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**", "/images/**", "/actuator/health", "/error",
                                "/sitemap.xml", "/robots.txt").permitAll()
                        // Le bloc ci-dessus ne vaut que pour un GET ; un navigateur ou un proxy peut
                        // envoyer HEAD/OPTIONS sur une image et recevait alors un 403.
                        .requestMatchers("/uploads/**", "/images/**", "/assets/**", "/manifest.json").permitAll()
                        // Le frontend React (SPA) et ses fichiers statiques sont publics : ce sont
                        // des pages HTML/JS, la protection des données reste sur /api/**.
                        .requestMatchers(HttpMethod.GET, "/", "/index.html", "/assets/**", "/favicon.ico",
                                "/manifest.json", "/logo192.png", "/logo512.png",
                                "/biens", "/biens/**", "/services", "/a-propos", "/contact",
                                "/admin", "/login", "/register", "/forgot-password", "/reset-password").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, authException) ->
                                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentification requise."))
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = new java.util.ArrayList<>(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://[::1]:*",
                "https://*.base44.app",
                "https://*.sergeserviceimmo.cm",
                "http://*.sergeserviceimmo.cm"
        ));
        // Adresses supplémentaires (téléphone sur le même Wi-Fi, IP du serveur, domaine
        // sans www…) : ALLOWED_ORIGINS=https://mon-domaine.cm,http://192.168.1.20:5173
        String extra = allowedOrigins == null ? "" : allowedOrigins.trim();
        if (!extra.isEmpty()) {
            for (String value : extra.split(",")) {
                if (!value.trim().isEmpty()) origins.add(value.trim());
            }
        }
        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

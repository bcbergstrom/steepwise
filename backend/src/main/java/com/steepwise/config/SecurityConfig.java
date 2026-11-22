package com.steepwise.config;

import com.steepwise.repository.UserRepository;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.ott.JdbcOneTimeTokenService;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
public class SecurityConfig {

    @Bean
    JdbcOneTimeTokenService oneTimeTokens(JdbcTemplate jdbc) {
        return new JdbcOneTimeTokenService(jdbc);
    }

    @Bean
    UserDetailsService signInUsers(UserRepository users, JdbcTemplate jdbc) {
        return id -> {
            UUID accountId = UUID.fromString(id);
            // Spring calls this only after successfully consuming the email token.
            jdbc.update("""
                WITH confirmed AS (
                    DELETE FROM pending_registrations WHERE id = ? AND expires_at > now()
                    RETURNING id, email, display_name
                )
                INSERT INTO users (id, email, display_name)
                SELECT id, email, display_name FROM confirmed
                WHERE NOT EXISTS (
                    SELECT 1 FROM users WHERE lower(users.email) = confirmed.email
                )
                ON CONFLICT (email) DO NOTHING
                """, accountId);
            return users.findById(accountId)
                .map(user -> User.withUsername(user.getId().toString()).password("").roles("USER").build())
                .orElseThrow(() -> new UsernameNotFoundException("Account unavailable"));
        };
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http, JdbcOneTimeTokenService tokens,
                                 @Value("${steepwise.public-url:http://localhost:5173}") String publicUrl)
            throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/csrf", "/api/auth/link", "/api/auth/register", "/login/ott",
                    "/v3/api-docs/**", "/swagger-ui/**", "/error").permitAll()
                .requestMatchers("/api/users/{userId}/teas", "/api/users/{userId}/teas/**")
                    .access((authentication, context) -> new org.springframework.security.authorization.AuthorizationDecision(
                        authentication.get().getName().equals(context.getVariables().get("userId"))))
                .requestMatchers("/api/users", "/api/users/**").denyAll()
                .anyRequest().authenticated())
            .exceptionHandling(errors -> errors.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .oneTimeTokenLogin(ott -> ott
                .loginPage("/auth").loginProcessingUrl("/login/ott")
                .showDefaultSubmitPage(false)
                .tokenService(tokens)
                .tokenGeneratingUrl("/internal/unused-token-generator")
                .generateRequestResolver(request -> null)
                .tokenGenerationSuccessHandler((request, response, token) -> response.setStatus(404))
                .successHandler((request, response, authentication) -> response.sendRedirect(publicUrl + "/journal"))
                .failureHandler((request, response, error) -> response.sendRedirect(publicUrl + "/auth?expired")))
            .headers(headers -> headers.referrerPolicy(policy -> policy.policy(
                org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER)))
            .logout(logout -> logout.logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
            .build();
    }
}

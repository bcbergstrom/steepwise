package com.steepwise.controller;

import com.steepwise.dto.UserResponse;
import com.steepwise.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import java.time.Duration;
import java.util.Locale;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import com.steepwise.service.AuthEmail;
import org.springframework.security.authentication.ott.GenerateOneTimeTokenRequest;
import org.springframework.security.authentication.ott.JdbcOneTimeTokenService;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class SignInController {

    private static final Logger log = LoggerFactory.getLogger(SignInController.class);

    private final UserRepository users;
    private final JdbcTemplate jdbc;
    private final JdbcOneTimeTokenService tokens;
    private final ObjectProvider<JavaMailSender> mailSender;
    private final String publicUrl;
    private final String from;
    private final AuthEmail authEmail;

    public SignInController(UserRepository users, JdbcTemplate jdbc, JdbcOneTimeTokenService tokens,
                            ObjectProvider<JavaMailSender> mailSender, AuthEmail authEmail,
                            @Value("${steepwise.public-url:http://localhost:5173}") String publicUrl,
                            @Value("${steepwise.mail-from:}") String from) {
        this.users = users;
        this.jdbc = jdbc;
        this.tokens = tokens;
        this.mailSender = mailSender;
        this.publicUrl = publicUrl;
        this.from = from;
        this.authEmail = authEmail;
    }

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken csrf) {
        return csrf;
    }

    @GetMapping("/session")
    public UserResponse session(Principal principal) {
        return users.findById(UUID.fromString(principal.getName())).map(UserResponse::from)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @PostMapping("/link")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void requestLink(@Valid @RequestBody LinkRequest request) {
        JavaMailSender sender = configuredMailSender();
        String email = request.email().trim();
        users.findByEmail(email).or(() -> users.findByEmail(email.toLowerCase(Locale.ROOT))).ifPresent(user -> {
            int reserved = jdbc.update("""
                INSERT INTO sign_in_link_requests (user_id, requested_at) VALUES (?, now())
                ON CONFLICT (user_id) DO UPDATE SET requested_at = now()
                WHERE sign_in_link_requests.requested_at < now() - interval '1 minute'
                """, user.getId());
            if (reserved == 0) {
                return;
            }

            sendLink(sender, user.getId(), user.getEmail(), AuthEmail.Kind.SIGN_IN);
        });
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void register(@Valid @RequestBody RegistrationRequest request) {
        JavaMailSender sender = configuredMailSender();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            return;
        }

        jdbc.update("DELETE FROM pending_registrations WHERE expires_at <= now()");
        UUID id = UUID.randomUUID();
        int reserved = jdbc.update("""
            INSERT INTO pending_registrations (id, email, display_name, expires_at)
            VALUES (?, ?, ?, now() + interval '5 minutes')
            ON CONFLICT (email) DO NOTHING
            """, id, email, request.displayName().strip());
        if (reserved == 1 && !sendLink(sender, id, email, AuthEmail.Kind.REGISTRATION)) {
            jdbc.update("DELETE FROM pending_registrations WHERE id = ?", id);
        }
    }

    private JavaMailSender configuredMailSender() {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null || from.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Sign-in email is unavailable");
        }
        return sender;
    }

    private boolean sendLink(JavaMailSender sender, UUID id, String recipient, AuthEmail.Kind kind) {
        var token = tokens.generate(new GenerateOneTimeTokenRequest(id.toString(), Duration.ofMinutes(5)));
        String link = publicUrl + "/login/ott?token=" + token.getTokenValue();

        try {
            var message = sender.createMimeMessage();
            var email = new MimeMessageHelper(message, true, "UTF-8");
            email.setFrom(from);
            email.setTo(recipient);
            email.setSubject(kind.subject());
            email.setText(authEmail.plainText(kind, link), authEmail.html(kind, link));
            sender.send(message);
            return true;
        } catch (MailException | MessagingException error) {
            jdbc.update("DELETE FROM one_time_tokens WHERE token_value = ?", token.getTokenValue());
            log.warn("Steep AI could not send an authentication email");
            return false;
        }
    }

    public record LinkRequest(@NotBlank @Email @Size(max = 255) String email) {}

    public record RegistrationRequest(
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 100) String displayName
    ) {}
}

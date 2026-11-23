package com.steepwise.service;

import jakarta.mail.MessagingException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tools.jackson.databind.JsonNode;

@Component
public class AuthEmailSender {
    private final ObjectProvider<JavaMailSender> smtp;
    private final AuthEmail templates;
    private final String from;
    private final String transport;
    private final String accountId;
    private final String apiToken;
    private final RestClient cloudflare;

    public AuthEmailSender(ObjectProvider<JavaMailSender> smtp, AuthEmail templates,
                           @Value("${steepwise.mail-from:}") String from,
                           @Value("${steepwise.email-transport:smtp}") String transport,
                           @Value("${steepwise.cloudflare-account-id:}") String accountId,
                           @Value("${steepwise.cloudflare-email-token:}") String apiToken) {
        this.smtp = smtp;
        this.templates = templates;
        this.from = from;
        this.transport = transport;
        this.accountId = accountId;
        this.apiToken = apiToken;
        var requests = new SimpleClientHttpRequestFactory();
        requests.setConnectTimeout(Duration.ofSeconds(5));
        requests.setReadTimeout(Duration.ofSeconds(5));
        this.cloudflare = RestClient.builder()
            .baseUrl("https://api.cloudflare.com/client/v4")
            .requestFactory(requests)
            .build();
    }

    public boolean isConfigured() {
        return !from.isBlank() && switch (transport) {
            case "smtp" -> smtp.getIfAvailable() != null;
            case "cloudflare" -> accountId.matches("[a-fA-F0-9]{32}") && !apiToken.isBlank();
            default -> false;
        };
    }

    public void send(String recipient, AuthEmail.Kind kind, String link) {
        String text = templates.plainText(kind, link);
        String html = templates.html(kind, link);
        if ("cloudflare".equals(transport)) {
            sendViaCloudflare(recipient, kind.subject(), text, html);
            return;
        }

        JavaMailSender sender = smtp.getObject();
        try {
            var message = sender.createMimeMessage();
            var email = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            email.setFrom(from);
            email.setTo(recipient);
            email.setSubject(kind.subject());
            email.setText(text, html);
            sender.send(message);
        } catch (MessagingException error) {
            throw new MailSendException("Could not prepare authentication email", error);
        }
    }

    private void sendViaCloudflare(String recipient, String subject, String text, String html) {
        try {
            JsonNode response = cloudflare.post()
                .uri("/accounts/{account}/email/sending/send", accountId)
                .headers(headers -> headers.setBearerAuth(apiToken))
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("from", from, "to", recipient, "subject", subject, "text", text, "html", html))
                .retrieve()
                .body(JsonNode.class);
            if (response == null || !response.path("success").asBoolean(false)
                    || response.path("result").path("message_id").asText("").isBlank()) {
                throw new MailSendException("Cloudflare did not accept the authentication email");
            }
        } catch (RestClientException error) {
            throw new MailSendException("Cloudflare email request failed");
        }
    }
}

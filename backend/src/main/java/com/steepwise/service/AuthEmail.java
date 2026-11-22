package com.steepwise.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

@Component
public class AuthEmail {
    private static final String LINK_NOTE = "This link expires in five minutes and can only be used once.";
    private static final String IGNORE_NOTE = "If you didn’t request this email, you can ignore it.";
    private final String template;

    public AuthEmail(@Value("classpath:mail/auth-link.html") Resource template) throws IOException {
        this.template = template.getContentAsString(StandardCharsets.UTF_8);
    }

    public String plainText(Kind kind, String link) {
        return "Steep AI\n\n" + kind.subject() + "\n" + kind.description() + "\n\n"
            + link + "\n\n" + LINK_NOTE + "\n" + IGNORE_NOTE;
    }

    public String html(Kind kind, String link) {
        return template
            .replace("{{heading}}", HtmlUtils.htmlEscape(kind.subject()))
            .replace("{{description}}", HtmlUtils.htmlEscape(kind.description()))
            .replace("{{button}}", HtmlUtils.htmlEscape(kind.button()))
            .replace("{{link_note}}", HtmlUtils.htmlEscape(LINK_NOTE))
            .replace("{{ignore_note}}", HtmlUtils.htmlEscape(IGNORE_NOTE))
            .replace("{{url}}", HtmlUtils.htmlEscape(link));
    }

    public enum Kind {
        SIGN_IN("Sign in to Steep AI", "Use this link to open your private tea journal.", "Sign in"),
        REGISTRATION("Confirm your Steep AI account", "Confirm your email to start keeping a journal of the teas you brew.", "Confirm my account");

        private final String subject;
        private final String description;
        private final String button;

        Kind(String subject, String description, String button) {
            this.subject = subject;
            this.description = description;
            this.button = button;
        }

        public String subject() {
            return subject;
        }

        String description() {
            return description;
        }

        String button() {
            return button;
        }
    }
}

package com.steepwise.controller;

import java.util.regex.Pattern;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

@RestController
public class ConfirmSignInController {

    private static final Pattern LINK_TOKEN = Pattern.compile(
        "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"
    );

    @GetMapping(value = "/login/ott", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> confirm(@RequestParam(defaultValue = "") String token, CsrfToken csrf) {
        String content;
        if (LINK_TOKEN.matcher(token).matches()) {
            content = """
                <h1>Confirm your email</h1>
                <p>Continue to your Steep AI journal.</p>
                <form method="post" action="/login/ott">
                  <input type="hidden" name="token" value="%s">
                  <input type="hidden" name="%s" value="%s">
                  <button type="submit">Continue to Steep AI</button>
                </form>
                """.formatted(token, HtmlUtils.htmlEscape(csrf.getParameterName()), HtmlUtils.htmlEscape(csrf.getToken()));
        } else {
            content = """
                <h1>This link is incomplete</h1>
                <p><a href="/auth">Request a new sign-in link</a> or <a href="/create-account">restart account setup</a>.</p>
                """;
        }
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body("""
            <!doctype html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Confirm your email | Steep AI</title>
              <style>
                body { margin: 0; padding: 1.5rem; background: #f8f7f0; color: #25332a; }
                main { max-width: 24rem; margin: 15vh auto 0; font: 1rem/1.5 system-ui, sans-serif; }
                h1 { font: 2.5rem/1.15 Georgia, serif; margin: .75rem 0; }
                button { padding: .75rem 1rem; background: #294332; color: white; border: 0;
                  border-radius: .375rem; font: inherit; cursor: pointer; }
                a { color: inherit; }
              </style>
            </head>
            <body><main><a href="/">Steep AI</a>%s</main></body>
            </html>
            """.formatted(content));
    }
}

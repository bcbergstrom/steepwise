package com.steepwise.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping(value = "/api/journal", produces = "application/json")
public class JournalController {

    private static final Pattern STOCK_WEIGHT = Pattern.compile(
        "([0-9]+(?:\\.[0-9]+)?)\\s*(g|grams?|kg|kilograms?)?", Pattern.CASE_INSENSITIVE
    );

    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    public JournalController(JdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    @GetMapping("/entries")
    public String entries(Principal principal) {
        return list(principal, "entry");
    }

    @GetMapping("/collection")
    public String collection(Principal principal) {
        return list(principal, "collection");
    }

    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public void addEntry(Principal principal, @Valid @RequestBody Entry entry) {
        if ((entry.teaId() == null) != (entry.gramsBrewed() == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A saved tea and brewed weight are required together");
        }
        if (entry.teaId() == null) {
            save(principal, "entry", entry);
            return;
        }

        UUID owner = UUID.fromString(principal.getName());
        UUID entryId = entry.requestId() == null ? UUID.randomUUID() : entry.requestId();
        String details = json.writeValueAsString(entry);
        int inserted = jdbc.update("""
            INSERT INTO journal_items (id, user_id, kind, details)
            VALUES (?, ?, 'entry', ?::jsonb) ON CONFLICT (id) DO NOTHING
            """, entryId, owner, details);
        if (inserted == 0) {
            Boolean sameEntry = jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM journal_items
                WHERE id = ? AND user_id = ? AND kind = 'entry' AND details = ?::jsonb)
                """, Boolean.class, entryId, owner, details);
            if (!Boolean.TRUE.equals(sameEntry)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Tasting entry request ID is already in use");
            }
            return;
        }

        var stock = jdbc.query("""
            SELECT details->>'quantity_stored' FROM journal_items
            WHERE id = ? AND user_id = ? AND kind = 'collection' FOR UPDATE
            """, (row, index) -> row.getString(1), entry.teaId(), owner);
        if (stock.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved tea unavailable");
        }

        String quantity = stock.getFirst();
        var weight = STOCK_WEIGHT.matcher(quantity == null ? "" : quantity.strip());
        if (!weight.matches()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Saved tea has no weight in grams or kilograms");
        }
        BigDecimal available = new BigDecimal(weight.group(1));
        if (weight.group(2) != null && Character.toLowerCase(weight.group(2).charAt(0)) == 'k') {
            available = available.movePointRight(3);
        }
        BigDecimal remaining = available.subtract(entry.gramsBrewed());
        if (remaining.signum() < 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Not enough tea remaining");
        }
        jdbc.update("""
            UPDATE journal_items SET details = jsonb_set(details, '{quantity_stored}', to_jsonb(CAST(? AS text)))
            WHERE id = ? AND user_id = ? AND kind = 'collection'
            """, remaining.stripTrailingZeros().toPlainString() + " g", entry.teaId(), owner);
    }

    @PostMapping("/collection")
    @ResponseStatus(HttpStatus.CREATED)
    public void addTea(Principal principal, @Valid @RequestBody CollectionTea tea) {
        BigDecimal min = tea.minTemperature();
        BigDecimal max = tea.maxTemperature();
        if ((min == null) != (max == null) || (min != null && min.compareTo(max) > 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid temperature range");
        }
        save(principal, "collection", tea);
    }

    @DeleteMapping("/entries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEntry(Principal principal, @PathVariable UUID id) {
        remove(principal, "entry", id);
    }

    @DeleteMapping("/collection/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTea(Principal principal, @PathVariable UUID id) {
        remove(principal, "collection", id);
    }

    private String list(Principal principal, String kind) {
        return jdbc.queryForObject("""
            SELECT COALESCE(jsonb_agg(details || jsonb_build_object(
                'id', id, 'brewed_on', COALESCE(details->'brewed_on', to_jsonb(created_at))
            ) ORDER BY created_at DESC, id DESC), '[]'::jsonb)::text
            FROM journal_items
            WHERE user_id = ? AND kind = ?
            """, String.class, UUID.fromString(principal.getName()), kind);
    }

    private void save(Principal principal, String kind, Object details) {
        jdbc.update("INSERT INTO journal_items (user_id, kind, details) VALUES (?, ?, ?::jsonb)",
            UUID.fromString(principal.getName()), kind, json.writeValueAsString(details));
    }

    private void remove(Principal principal, String kind, UUID id) {
        int deleted = jdbc.update("DELETE FROM journal_items WHERE user_id = ? AND kind = ? AND id = ?",
            UUID.fromString(principal.getName()), kind, id);
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    public record Entry(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 100) String type,
        @NotNull @Size(max = 100) String temp,
        @JsonProperty("steep_time") @NotNull @Size(max = 100) String steepTime,
        @Min(1) @Max(5) Integer rating,
        @JsonProperty("steep_count") @Min(1) Integer steepCount,
        @NotNull @Size(max = 5000) String notes,
        @JsonProperty("tea_id") UUID teaId,
        @JsonProperty("grams_brewed") @Positive @Digits(integer = 9, fraction = 3) BigDecimal gramsBrewed,
        @JsonProperty("request_id") UUID requestId
    ) {}

    public record CollectionTea(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 100) String type,
        @JsonProperty("origin_country") @Size(max = 200) String originCountry,
        @JsonProperty("origin_region") @Size(max = 200) String originRegion,
        @JsonProperty("harvest_year") @Min(1) @Max(9999) Integer harvestYear,
        @JsonProperty("harvest_season") @Size(max = 100) String harvestSeason,
        @JsonProperty("quantity_stored") @Size(max = 100) String quantityStored,
        @Size(max = 5000) String notes,
        @JsonProperty("recommended_temp_min") @Min(0) @Max(100) BigDecimal minTemperature,
        @JsonProperty("recommended_temp_max") @Min(0) @Max(100) BigDecimal maxTemperature
    ) {}
}

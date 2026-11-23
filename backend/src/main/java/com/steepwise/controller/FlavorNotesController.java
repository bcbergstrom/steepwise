package com.steepwise.controller;

import com.steepwise.service.FlavorNotesService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/journal")
public class FlavorNotesController {
    private final FlavorNotesService flavorNotes;

    public FlavorNotesController(FlavorNotesService flavorNotes) {
        this.flavorNotes = flavorNotes;
    }

    @PostMapping("/describe-notes")
    public Suggestion describe(Principal principal, @Valid @RequestBody Draft draft) {
        return new Suggestion(flavorNotes.describe(principal.getName(), draft.notes().strip()));
    }

    public record Draft(@NotBlank @Size(max = 5000) String notes) {}
    public record Suggestion(String suggestion) {}
}

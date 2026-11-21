package com.steepwise.controller;

import com.steepwise.dto.TeaRequest;
import com.steepwise.dto.TeaResponse;
import com.steepwise.service.TeaService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/{userId}/teas")
public class TeaController {

    private final TeaService teaService;

    public TeaController(TeaService teaService) {
        this.teaService = teaService;
    }

    @GetMapping
    public List<TeaResponse> getAllTeas(
        @PathVariable UUID userId
    ) {
        return teaService.getAllTeas(userId);
    }

    @GetMapping("/{teaId}")
    public TeaResponse getTeaById(
        @PathVariable UUID userId,
        @PathVariable UUID teaId
    ) {
        return teaService.getTeaById(userId, teaId);
    }

    @PostMapping
    public ResponseEntity<TeaResponse> createTea(
        @PathVariable UUID userId,
        @Valid @RequestBody TeaRequest request
    ) {
        TeaResponse created = teaService.createTea(userId, request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(created);
    }

    @PutMapping("/{teaId}")
    public TeaResponse updateTea(
        @PathVariable UUID userId,
        @PathVariable UUID teaId,
        @Valid @RequestBody TeaRequest request
    ) {
        return teaService.updateTea(userId, teaId, request);
    }

    @DeleteMapping("/{teaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTea(
        @PathVariable UUID userId,
        @PathVariable UUID teaId
    ) {
        teaService.deleteTea(userId, teaId);
    }
}
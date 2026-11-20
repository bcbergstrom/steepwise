package com.steepwise.controller;

import com.steepwise.dto.TeaRequest;
import com.steepwise.model.Tea;
import com.steepwise.service.TeaService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teas")
public class TeaController {

    private final TeaService teaService;

    public TeaController(TeaService teaService) {
        this.teaService = teaService;
    }

    @GetMapping
    public List<Tea> getAllTeas() {
        return teaService.getAllTeas();
    }

    @GetMapping("/{id}")
    public Tea getTeaById(@PathVariable Long id) {
        return teaService.getTeaById(id);
    }

    @PostMapping
    public ResponseEntity<Tea> createTea(
            @Valid @RequestBody TeaRequest request) {

        Tea created = teaService.createTea(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(created);
    }

    @PutMapping("/{id}")
    public Tea updateTea(
            @PathVariable Long id,
            @Valid @RequestBody TeaRequest request) {

        return teaService.updateTea(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTea(@PathVariable Long id) {
        teaService.deleteTea(id);
    }
}
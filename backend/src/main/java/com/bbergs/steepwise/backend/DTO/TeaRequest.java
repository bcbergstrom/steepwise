package com.steepwise.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record TeaRequest(
    @NotBlank String name,
    @NotBlank String type,
    @Min(1) int steepTimeSeconds
) {}
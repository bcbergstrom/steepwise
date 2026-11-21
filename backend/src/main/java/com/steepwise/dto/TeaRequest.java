
package com.steepwise.dto;

import com.steepwise.model.HarvestSeason;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record TeaRequest(
    @NotBlank
    @Size(max = 200)
    String name,

    @NotBlank
    @Size(max = 50)
    String teaType,

    String originCountry,

    String originRegion,

    Integer harvestYear,

    HarvestSeason harvestSeason,

    @DecimalMin("0.00")
    @Digits(integer = 6, fraction = 2)
    BigDecimal quantityGrams,
    @Min(0)
@Max(100)
Integer recommendedTempMinC,

@Min(0)
@Max(100)
Integer recommendedTempMaxC,

    String notes
) {}

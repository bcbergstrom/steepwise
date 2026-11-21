
package com.steepwise.dto;

import com.steepwise.model.Tea;
import com.steepwise.model.HarvestSeason;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TeaResponse(
    UUID id,
    UUID userId,
    String name,
    String teaType,
    String originCountry,
    String originRegion,
    Integer harvestYear,
    HarvestSeason harvestSeason,
    BigDecimal quantityGrams,
    Integer recommendedTempMinC,
    Integer recommendedTempMaxC,
    String notes,
    OffsetDateTime createdAt
) {

    public static TeaResponse from(Tea tea) {
        return new TeaResponse(
            tea.getId(),
            tea.getUser().getId(),
            tea.getName(),
            tea.getTeaType(),
            tea.getOriginCountry(),
            tea.getOriginRegion(),
            tea.getHarvestYear(),
            tea.getHarvestSeason(),
            tea.getQuantityGrams(),
            tea.getRecommendedTempMinC(),
            tea.getRecommendedTempMaxC(),
            tea.getNotes(),
            tea.getCreatedAt()
        );
    }
}

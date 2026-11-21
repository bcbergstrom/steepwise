package com.steepwise.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name="teas")
public class Tea {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable=false)
    private User user;


    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "tea_type", nullable = false, length = 50)
    private String teaType;

    // 4. Optional origin information
    @Column(name = "origin_country", length = 100)
    private String originCountry;

    @Column(name = "origin_region", length = 150)
    private String originRegion;

    @Column(name = "harvest_year")
    private Integer harvestYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "harvest_season", length = 20)
    private HarvestSeason harvestSeason;

    @Column(name = "recommended_temp_min_c")
private Integer recommendedTempMinC;

@Column(name = "recommended_temp_max_c")
private Integer recommendedTempMaxC;
    // 5. Inventory information
    @Column(name = "quantity_grams", precision = 8, scale = 2)
    private BigDecimal quantityGrams;

    // 6. Additional notes
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    

    // 7. Created automatically by PostgreSQL
    @Column(
        name = "created_at",
        nullable = false,
        insertable = false,
        updatable = false
    )
    private OffsetDateTime createdAt;

    // Required by JPA
    protected Tea() {
    }

    // Constructor for creating new teas
    public Tea(User user, String name, String teaType) {
        this.user = user;
        this.name = name;
        this.teaType = teaType;
    }

    // Getters
    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getName() {
        return name;
    }

    public String getTeaType() {
        return teaType;
    }

    public String getOriginCountry() {
        return originCountry;
    }

    public String getOriginRegion() {
        return originRegion;
    }

    public Integer getHarvestYear() {
        return harvestYear;
    }

    public BigDecimal getQuantityGrams() {
        return quantityGrams;
    }

    public String getNotes() {
        return notes;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    // Setters for editable fields
    public void setName(String name) {
        this.name = name;
    }

    public void setTeaType(String teaType) {
        this.teaType = teaType;
    }

    public void setOriginCountry(String originCountry) {
        this.originCountry = originCountry;
    }

    public void setOriginRegion(String originRegion) {
        this.originRegion = originRegion;
    }

    public void setHarvestYear(Integer harvestYear) {
        this.harvestYear = harvestYear;
    }

    public void setQuantityGrams(BigDecimal quantityGrams) {
        this.quantityGrams = quantityGrams;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
    public HarvestSeason getHarvestSeason() {
    return harvestSeason;
}

public void setHarvestSeason(HarvestSeason harvestSeason) {
    this.harvestSeason = harvestSeason;
}
    public Integer getRecommendedTempMinC() {
    return recommendedTempMinC;
}

public void setRecommendedTempMinC(Integer recommendedTempMinC) {
    this.recommendedTempMinC = recommendedTempMinC;
}

public Integer getRecommendedTempMaxC() {
    return recommendedTempMaxC;
}

public void setRecommendedTempMaxC(Integer recommendedTempMaxC) {
    this.recommendedTempMaxC = recommendedTempMaxC;
}
}

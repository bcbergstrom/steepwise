package com.steepwise.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tasting_sessions")
public class Tasting {
    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "journal_entry_id", updatable = false)
    private UUID journalEntryId;

    @Column(name = "journal_tea_id")
    private UUID journalTeaId;

    @Column(name = "tea_name", length = 200)
    private String teaName;

    @Column(name = "tea_type", length = 100)
    private String teaType;

    @Column(name = "tasted_at", nullable = false, insertable = false, updatable = false)
    private Instant tastedAt;

    @Column(name = "leaf_grams", precision = 12, scale = 3)
    private BigDecimal leafGrams;

    @Column(name = "temperature_note", length = 100)
    private String temperatureNote;

    @Column(name = "steep_time", length = 100)
    private String steepTime;

    @Column(name = "steep_count")
    private Integer steepCount;

    @Column(name = "overall_rating")
    private Integer overallRating;

    @Column(name = "overall_notes", columnDefinition = "text")
    private String overallNotes;

    protected Tasting() {}

    public Tasting(UUID entryId, UUID userId, UUID teaId, String teaName, String teaType,
                   BigDecimal leafGrams, String temperatureNote, String steepTime,
                   Integer steepCount, Integer rating, String notes) {
        this.id = entryId;
        this.journalEntryId = entryId;
        this.userId = userId;
        this.journalTeaId = teaId;
        this.teaName = teaName;
        this.teaType = teaType;
        this.leafGrams = leafGrams;
        this.temperatureNote = temperatureNote;
        this.steepTime = steepTime;
        this.steepCount = steepCount;
        this.overallRating = rating;
        this.overallNotes = notes;
    }
}

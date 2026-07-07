package com.greenthumb.backend.plant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "plant")
public class Plant {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "common_name", nullable = false)
    private String commonName;

    @Column(name = "scientific_name")
    private String scientificName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlantCategory category;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "light_requirement", nullable = false)
    private LightRequirement lightRequirement;

    @Column(name = "light_notes")
    private String lightNotes;

    @Column(name = "watering_interval_days")
    private Integer wateringIntervalDays;

    @Column(name = "watering_notes")
    private String wateringNotes;

    @Column(name = "soil_notes")
    private String soilNotes;

    @Column(name = "feeding_notes")
    private String feedingNotes;

    @Column(name = "pruning_notes")
    private String pruningNotes;

    @Column(name = "is_harvestable", nullable = false)
    private boolean harvestable;

    @Column(name = "days_to_maturity_min")
    private Integer daysToMaturityMin;

    @Column(name = "days_to_maturity_max")
    private Integer daysToMaturityMax;

    @Column(name = "harvest_notes")
    private String harvestNotes;

    @Column(name = "image_url")
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Plant() {
        // for JPA
    }

    public UUID getId() {
        return id;
    }

    public String getCommonName() {
        return commonName;
    }

    public String getScientificName() {
        return scientificName;
    }

    public PlantCategory getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public LightRequirement getLightRequirement() {
        return lightRequirement;
    }

    public String getLightNotes() {
        return lightNotes;
    }

    public Integer getWateringIntervalDays() {
        return wateringIntervalDays;
    }

    public String getWateringNotes() {
        return wateringNotes;
    }

    public String getSoilNotes() {
        return soilNotes;
    }

    public String getFeedingNotes() {
        return feedingNotes;
    }

    public String getPruningNotes() {
        return pruningNotes;
    }

    public boolean isHarvestable() {
        return harvestable;
    }

    public Integer getDaysToMaturityMin() {
        return daysToMaturityMin;
    }

    public Integer getDaysToMaturityMax() {
        return daysToMaturityMax;
    }

    public String getHarvestNotes() {
        return harvestNotes;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

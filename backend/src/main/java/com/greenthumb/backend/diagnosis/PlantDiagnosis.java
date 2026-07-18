package com.greenthumb.backend.diagnosis;

import com.greenthumb.backend.photo.Photo;
import com.greenthumb.backend.planting.PlantedPlant;
import com.greenthumb.backend.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

/**
 * A photo-based diagnosis or a text-only care suggestion for a planting - the same shape either
 * way, distinguished only by whether {@code photo} is set.
 */
@Entity
@Table(name = "plant_diagnosis")
public class PlantDiagnosis {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planted_plant_id", nullable = false)
    private PlantedPlant plantedPlant;

    // Null for a text-only care suggestion (no photo involved).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id")
    private Photo photo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private AppUser owner;

    @Column(name = "result_text", nullable = false)
    private String resultText;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected PlantDiagnosis() {
        // for JPA
    }

    public PlantDiagnosis(AppUser owner, PlantedPlant plantedPlant, Photo photo, String resultText) {
        this.owner = owner;
        this.plantedPlant = plantedPlant;
        this.photo = photo;
        this.resultText = resultText;
    }

    public UUID getId() {
        return id;
    }

    public PlantedPlant getPlantedPlant() {
        return plantedPlant;
    }

    public Photo getPhoto() {
        return photo;
    }

    public AppUser getOwner() {
        return owner;
    }

    public String getResultText() {
        return resultText;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

package com.greenthumb.backend.planting;

import com.greenthumb.backend.container.Container;
import com.greenthumb.backend.plant.Plant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "planted_plant")
public class PlantedPlant {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_id", nullable = false)
    private Container container;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plant_id", nullable = false)
    private Plant plant;

    private String nickname;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "planned_date")
    private LocalDate plannedDate;

    @Column(name = "planted_date")
    private LocalDate plantedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlantingStatus status;

    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected PlantedPlant() {
        // for JPA
    }

    public PlantedPlant(
            Container container,
            Plant plant,
            String nickname,
            int quantity,
            LocalDate plannedDate,
            LocalDate plantedDate,
            PlantingStatus status,
            String notes) {
        this.container = container;
        this.plant = plant;
        this.nickname = nickname;
        this.quantity = quantity;
        this.plannedDate = plannedDate;
        this.plantedDate = plantedDate;
        this.status = status;
        this.notes = notes;
    }

    public UUID getId() {
        return id;
    }

    public Container getContainer() {
        return container;
    }

    public Plant getPlant() {
        return plant;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public LocalDate getPlannedDate() {
        return plannedDate;
    }

    public void setPlannedDate(LocalDate plannedDate) {
        this.plannedDate = plannedDate;
    }

    public LocalDate getPlantedDate() {
        return plantedDate;
    }

    public void setPlantedDate(LocalDate plantedDate) {
        this.plantedDate = plantedDate;
    }

    public PlantingStatus getStatus() {
        return status;
    }

    public void setStatus(PlantingStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

package com.greenthumb.backend.garden;

import com.greenthumb.backend.user.AppUser;
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
@Table(name = "garden")
public class Garden {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private AppUser owner;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GardenType type;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "light_source")
    private GardenLightSource lightSource;

    @Column(name = "light_hours_per_day")
    private Integer lightHoursPerDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "light_exposure")
    private GardenLightExposure lightExposure;

    private String city;

    private String state;

    @Column(name = "zip_code")
    private String zipCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "climate_zone")
    private ClimateZone climateZone;

    @Column(name = "last_frost_date")
    private LocalDate lastFrostDate;

    @Column(name = "first_frost_date")
    private LocalDate firstFrostDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Garden() {
        // for JPA
    }

    public Garden(AppUser owner, String name, GardenType type, String description) {
        this.owner = owner;
        this.name = name;
        this.type = type;
        this.description = description;
    }

    public UUID getId() {
        return id;
    }

    public AppUser getOwner() {
        return owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GardenType getType() {
        return type;
    }

    public void setType(GardenType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public GardenLightSource getLightSource() {
        return lightSource;
    }

    public void setLightSource(GardenLightSource lightSource) {
        this.lightSource = lightSource;
    }

    public Integer getLightHoursPerDay() {
        return lightHoursPerDay;
    }

    public void setLightHoursPerDay(Integer lightHoursPerDay) {
        this.lightHoursPerDay = lightHoursPerDay;
    }

    public GardenLightExposure getLightExposure() {
        return lightExposure;
    }

    public void setLightExposure(GardenLightExposure lightExposure) {
        this.lightExposure = lightExposure;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public ClimateZone getClimateZone() {
        return climateZone;
    }

    public void setClimateZone(ClimateZone climateZone) {
        this.climateZone = climateZone;
    }

    public LocalDate getLastFrostDate() {
        return lastFrostDate;
    }

    public void setLastFrostDate(LocalDate lastFrostDate) {
        this.lastFrostDate = lastFrostDate;
    }

    public LocalDate getFirstFrostDate() {
        return firstFrostDate;
    }

    public void setFirstFrostDate(LocalDate firstFrostDate) {
        this.firstFrostDate = firstFrostDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

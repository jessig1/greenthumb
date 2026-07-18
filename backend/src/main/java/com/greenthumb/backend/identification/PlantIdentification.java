package com.greenthumb.backend.identification;

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
 * A record of one AI plant-identification scan, kept so it can show up in the user's recent
 * activity. Separate from {@code ai.PlantIdentificationService}, which only handles the live
 * OpenAI call plus catalog matching/creation - this is just the persisted history of that.
 */
@Entity
@Table(name = "plant_identification")
public class PlantIdentification {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private AppUser owner;

    @Column(name = "suggested_common_name")
    private String suggestedCommonName;

    @Column(name = "suggested_scientific_name")
    private String suggestedScientificName;

    // Deliberately a raw UUID rather than a @ManyToOne to Plant - the DTO never needs the
    // matched plant's own fields (just its id, to link to it), so a relation would only add
    // lazy-loading risk for no benefit. The DB-level FK (ON DELETE SET NULL) still keeps this
    // consistent with the plant table.
    @Column(name = "matched_plant_id")
    private UUID matchedPlantId;

    @Column(name = "added_to_catalog", nullable = false)
    private boolean addedToCatalog;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected PlantIdentification() {
        // for JPA
    }

    public PlantIdentification(
            AppUser owner,
            String suggestedCommonName,
            String suggestedScientificName,
            UUID matchedPlantId,
            boolean addedToCatalog) {
        this.owner = owner;
        this.suggestedCommonName = suggestedCommonName;
        this.suggestedScientificName = suggestedScientificName;
        this.matchedPlantId = matchedPlantId;
        this.addedToCatalog = addedToCatalog;
    }

    public UUID getId() {
        return id;
    }

    public AppUser getOwner() {
        return owner;
    }

    public String getSuggestedCommonName() {
        return suggestedCommonName;
    }

    public String getSuggestedScientificName() {
        return suggestedScientificName;
    }

    public UUID getMatchedPlantId() {
        return matchedPlantId;
    }

    public boolean isAddedToCatalog() {
        return addedToCatalog;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

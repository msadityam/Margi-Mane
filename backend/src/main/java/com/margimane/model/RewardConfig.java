package com.margimane.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "reward_config")
public class RewardConfig {
    @Id
    private Long id = 1L;
    @Column(name = "rupees_per_unit", nullable = false) private Integer rupeesPerUnit = 100;
    @Column(name = "points_per_unit", nullable = false) private Integer pointsPerUnit = 10;
    @Column(name = "updated_by") private Long updatedBy;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getRupeesPerUnit() { return rupeesPerUnit; }
    public void setRupeesPerUnit(Integer rupeesPerUnit) { this.rupeesPerUnit = rupeesPerUnit; }
    public Integer getPointsPerUnit() { return pointsPerUnit; }
    public void setPointsPerUnit(Integer pointsPerUnit) { this.pointsPerUnit = pointsPerUnit; }
    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

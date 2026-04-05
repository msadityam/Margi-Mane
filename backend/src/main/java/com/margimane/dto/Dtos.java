package com.margimane.dto;

import com.margimane.model.Enums;
import java.time.Instant;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public class Dtos {
    public record AuthResponse(String token, Long id, String name, String mobileNumber, Enums.Role role, Integer pointsBalance) {}
    public record LoginRequest(
            @NotBlank String name,
            @NotBlank @Pattern(regexp = "^[0-9]{10}$", message = "mobileNumber must be 10 digits") String mobileNumber,
            String adminPassword) {}
    public record MenuItemRequest(@NotBlank String name, @NotNull @Positive Integer price, @NotNull Enums.MenuCategory category, Boolean active) {}
    public record PaymentRequest(@NotNull @Positive Integer amount, String upiRefId) {}
    public record DecisionRequest(String note) {}
    public record RewardConfigRequest(@NotNull @Positive Integer rupeesPerUnit, @NotNull @Positive Integer pointsPerUnit) {}
    public record PointsAdjustRequest(@NotNull Integer pointsDelta, @NotBlank String note) {}
    public record RoleUpdateRequest(@NotNull Enums.Role role) {}
    public record AnnouncementRequest(String title, @NotBlank String message, Boolean active) {}
    public record RedeemRequest(@NotNull @Positive Integer points) {}
    public record AdminPaymentView(
            Long id,
            String userName,
            String mobileNumber,
            Integer amount,
            String upiRefId,
            Enums.PaymentStatus status,
            String reviewNote,
            Instant createdAt) {}
}

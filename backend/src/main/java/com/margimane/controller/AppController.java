package com.margimane.controller;

import com.margimane.dto.Dtos;
import com.margimane.model.Enums;
import com.margimane.service.AppService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AppController {
    private final AppService service;
    @Value("${app.business.name}") private String businessName;
    @Value("${app.business.phone}") private String businessPhone;
    @Value("${app.business.maps-url}") private String businessMapsUrl;

    public AppController(AppService service) { this.service = service; }
    private com.margimane.model.User me(Principal principal) { return service.me(principal.getName()); }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
    @PostMapping("/auth/login")
    public Dtos.AuthResponse login(@Valid @RequestBody Dtos.LoginRequest request) { return service.login(request); }
    @GetMapping("/auth/me")
    public Object authMe(Principal principal) { return me(principal); }

    @GetMapping("/menu") public Object menu() { return service.menu(); }
    @GetMapping("/announcements") public Object announcements() { return service.announcements(); }
    @GetMapping("/public/business-info")
    public Map<String, String> businessInfo() { return Map.of("hotelName", businessName, "phone", businessPhone, "mapsUrl", businessMapsUrl); }

    @PostMapping("/payments") public Object submitPayment(Principal principal, @Valid @RequestBody Dtos.PaymentRequest req) { return service.submitPayment(me(principal), req); }
    @GetMapping("/payments/my") public Object myPayments(Principal principal) { return service.myPayments(me(principal).getId()); }
    @GetMapping("/points/me") public Object myPoints(Principal principal) { var u = me(principal); return Map.of("pointsBalance", u.getPointsBalance(), "history", service.myPointsHistory(u.getId())); }
    @PostMapping("/points/redeem") public Object redeem(Principal principal, @Valid @RequestBody Dtos.RedeemRequest req) { return service.redeemPoints(me(principal), req); }

    @GetMapping("/admin/dashboard") public Object dashboard() { return service.adminDashboard(); }
    @GetMapping("/admin/users") public Object users() { return service.users(); }
    @GetMapping("/admin/users/search") public Object searchUsers(@RequestParam(defaultValue = "") String query, @RequestParam(defaultValue = "0") int page) { return service.searchUsers(query, page); }
    @PatchMapping("/admin/users/{id}/role") public Object updateRole(@PathVariable Long id, @Valid @RequestBody Dtos.RoleUpdateRequest req) { return service.updateRole(id, req); }
    @PatchMapping("/admin/users/{id}/points") public Object adjustPoints(@PathVariable Long id, @Valid @RequestBody Dtos.PointsAdjustRequest req, Principal principal) { return service.adjustPoints(id, req, me(principal)); }

    @GetMapping("/admin/menu") public Object allMenu() { return service.allMenu(); }
    @PostMapping("/admin/menu") public Object addMenu(@Valid @RequestBody Dtos.MenuItemRequest req) { return service.upsertMenu(null, req); }
    @PutMapping("/admin/menu/{id}") public Object editMenu(@PathVariable Long id, @Valid @RequestBody Dtos.MenuItemRequest req) { return service.upsertMenu(id, req); }
    @DeleteMapping("/admin/menu/{id}") public void deleteMenu(@PathVariable Long id) { service.deleteMenu(id); }

    @GetMapping("/admin/reward-config") public Object rewardConfig() { return service.rewardConfig(); }
    @PutMapping("/admin/reward-config") public Object updateRewardConfig(@Valid @RequestBody Dtos.RewardConfigRequest req, Principal principal) { return service.updateRewardConfig(me(principal), req); }

    @GetMapping("/admin/payments") public Object pending(@RequestParam(defaultValue = "PENDING") Enums.PaymentStatus status) { return service.adminPaymentViews(status); }
    @PatchMapping("/admin/payments/{id}/approve") public Object approve(@PathVariable Long id, @RequestBody(required = false) Dtos.DecisionRequest req, Principal principal) { return service.approvePayment(id, me(principal), req == null ? null : req.note()); }
    @PatchMapping("/admin/payments/{id}/reject") public Object reject(@PathVariable Long id, @RequestBody(required = false) Dtos.DecisionRequest req, Principal principal) { return service.rejectPayment(id, me(principal), req == null ? null : req.note()); }

    @GetMapping("/admin/announcements") public Object allAnnouncements() { return service.allAnnouncements(); }
    @PostMapping("/admin/announcements") public Object createAnnouncement(@Valid @RequestBody Dtos.AnnouncementRequest req, Principal principal) { return service.upsertAnnouncement(null, req, me(principal)); }
    @PatchMapping("/admin/announcements/{id}") public Object updateAnnouncement(@PathVariable Long id, @Valid @RequestBody Dtos.AnnouncementRequest req, Principal principal) { return service.upsertAnnouncement(id, req, me(principal)); }
    @DeleteMapping("/admin/announcements/{id}") public void deleteAnnouncement(@PathVariable Long id) { service.deleteAnnouncement(id); }
}

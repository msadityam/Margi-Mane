package com.margimane.service;

import com.margimane.dto.Dtos;
import com.margimane.model.*;
import com.margimane.repository.*;
import com.margimane.security.JwtService;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppService {
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final PaymentRepository paymentRepository;
    private final PointsTransactionRepository pointsTransactionRepository;
    private final RewardConfigRepository rewardConfigRepository;
    private final AnnouncementRepository announcementRepository;
    private final JwtService jwtService;
    private final String adminMobile;
    private final String adminPassword;

    public AppService(UserRepository userRepository, MenuItemRepository menuItemRepository, PaymentRepository paymentRepository,
                      PointsTransactionRepository pointsTransactionRepository, RewardConfigRepository rewardConfigRepository,
                      AnnouncementRepository announcementRepository, JwtService jwtService,
                      @Value("${app.admin.mobile:9886025999}") String adminMobile,
                      @Value("${app.admin.password:godisgreat}") String adminPassword) {
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
        this.paymentRepository = paymentRepository;
        this.pointsTransactionRepository = pointsTransactionRepository;
        this.rewardConfigRepository = rewardConfigRepository;
        this.announcementRepository = announcementRepository;
        this.jwtService = jwtService;
        this.adminMobile = adminMobile;
        this.adminPassword = adminPassword;
    }

    @Transactional
    public Dtos.AuthResponse login(Dtos.LoginRequest request) {
        boolean isAdminMobile = request.mobileNumber().equals(adminMobile);
        if (isAdminMobile && (request.adminPassword() == null || request.adminPassword().isBlank())) {
            throw new AdminPasswordRequiredException("Admin password required");
        }
        if (isAdminMobile && !adminPassword.equals(request.adminPassword())) {
            throw new IllegalArgumentException("Invalid admin password");
        }
        User user = userRepository.findByMobileNumber(request.mobileNumber()).orElseGet(() -> {
            User u = new User();
            u.setName(request.name());
            u.setMobileNumber(request.mobileNumber());
            u.setRole(Enums.Role.USER);
            u.setPointsBalance(0);
            return userRepository.save(u);
        });
        user.setName(request.name());
        if (isAdminMobile) {
            user.setRole(Enums.Role.ADMIN);
        }
        user = userRepository.save(user);
        String token = jwtService.generate(user.getMobileNumber());
        return new Dtos.AuthResponse(token, user.getId(), user.getName(), user.getMobileNumber(), user.getRole(), user.getPointsBalance());
    }

    public User me(String mobile) { return userRepository.findByMobileNumber(mobile).orElseThrow(); }
    public List<MenuItem> menu() { return menuItemRepository.findByActiveTrueOrderByCategoryAscNameAsc(); }
    public List<Announcement> announcements() { return announcementRepository.findByActiveTrueOrderByCreatedAtDesc(); }
    public List<Announcement> allAnnouncements() { return announcementRepository.findAllByOrderByCreatedAtDesc(); }
    public List<MenuItem> allMenu() { return menuItemRepository.findAllByOrderByCategoryAscNameAsc(); }
    public RewardConfig rewardConfig() {
        return rewardConfigRepository.findById(1L).orElseGet(() -> {
            RewardConfig rc = new RewardConfig();
            rc.setId(1L);
            rc.setRupeesPerUnit(100);
            rc.setPointsPerUnit(10);
            return rewardConfigRepository.save(rc);
        });
    }
    public List<Payment> myPayments(Long userId) { return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId); }
    public List<PointsTransaction> myPointsHistory(Long userId) { return pointsTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId); }

    @Transactional public MenuItem upsertMenu(Long id, Dtos.MenuItemRequest r) {
        MenuItem item = id == null ? new MenuItem() : menuItemRepository.findById(id).orElseThrow();
        item.setName(r.name()); item.setPrice(r.price()); item.setCategory(r.category()); item.setActive(r.active() == null || r.active());
        return menuItemRepository.save(item);
    }
    @Transactional public void deleteMenu(Long id) { menuItemRepository.deleteById(id); }

    @Transactional
    public Payment submitPayment(User user, Dtos.PaymentRequest request) {
        Payment p = new Payment();
        p.setUser(user); p.setAmount(request.amount()); p.setUpiRefId(request.upiRefId()); p.setStatus(Enums.PaymentStatus.PENDING);
        return paymentRepository.save(p);
    }

    public List<Payment> paymentsByStatus(Enums.PaymentStatus status) { return paymentRepository.findByStatusOrderByCreatedAtAsc(status); }
    @Transactional(readOnly = true)
    public List<Dtos.AdminPaymentView> adminPaymentViews(Enums.PaymentStatus status) {
        return paymentRepository.findByStatusWithUser(status).stream().map(p ->
                new Dtos.AdminPaymentView(
                        p.getId(),
                        p.getUser().getName(),
                        p.getUser().getMobileNumber(),
                        p.getAmount(),
                        p.getUpiRefId(),
                        p.getStatus(),
                        p.getReviewNote(),
                        p.getCreatedAt())
        ).toList();
    }

    @Transactional
    public Payment approvePayment(Long paymentId, User admin, String note) {
        Payment p = paymentRepository.findById(paymentId).orElseThrow(() -> new EntityNotFoundException("Payment not found"));
        if (p.getStatus() != Enums.PaymentStatus.PENDING) return p;
        p.setStatus(Enums.PaymentStatus.APPROVED);
        p.setReviewNote(note);
        p.setReviewedBy(admin.getId());
        p.setReviewedAt(Instant.now());
        
        User u = p.getUser();
        RewardConfig cfg = rewardConfig();
        
        // Calculate total approved payments BEFORE this one
        int previousApprovedAmount = paymentRepository.findByUserIdAndStatus(u.getId(), Enums.PaymentStatus.APPROVED)
                .stream()
                .mapToInt(Payment::getAmount)
                .sum();
        
        // Calculate total approved payments AFTER this one
        int totalApprovedAmount = previousApprovedAmount + p.getAmount();
        
        // Calculate points at each stage based on cumulative total
        int previousPointsEarned = calculateEarnedPoints(previousApprovedAmount, cfg.getRupeesPerUnit(), cfg.getPointsPerUnit());
        int totalPointsEarned = calculateEarnedPoints(totalApprovedAmount, cfg.getRupeesPerUnit(), cfg.getPointsPerUnit());
        int earned = totalPointsEarned - previousPointsEarned;
        
        if (earned > 0) {
            u.setPointsBalance(u.getPointsBalance() + earned);
            userRepository.save(u);
            PointsTransaction txn = new PointsTransaction();
            txn.setUser(u); txn.setPayment(p); txn.setType(Enums.PointsTransactionType.EARN); txn.setPoints(earned);
            txn.setNote(note == null || note.isBlank() ? "Payment approved" : note);
            pointsTransactionRepository.save(txn);
        }
        
        return paymentRepository.save(p);
    }

    public static int calculateEarnedPoints(int amount, int rupeesPerUnit, int pointsPerUnit) {
        return (amount / rupeesPerUnit) * pointsPerUnit;
    }

    @Transactional
    public Payment rejectPayment(Long paymentId, User admin, String note) {
        Payment p = paymentRepository.findById(paymentId).orElseThrow(() -> new EntityNotFoundException("Payment not found"));
        if (p.getStatus() != Enums.PaymentStatus.PENDING) return p;
        p.setStatus(Enums.PaymentStatus.REJECTED);
        p.setReviewNote(note);
        p.setReviewedBy(admin.getId());
        p.setReviewedAt(Instant.now());
        return paymentRepository.save(p);
    }

    @Transactional
    public RewardConfig updateRewardConfig(User admin, Dtos.RewardConfigRequest req) {
        RewardConfig rc = rewardConfig();
        rc.setRupeesPerUnit(req.rupeesPerUnit());
        rc.setPointsPerUnit(req.pointsPerUnit());
        rc.setUpdatedBy(admin.getId());
        rc.setUpdatedAt(Instant.now());
        return rewardConfigRepository.save(rc);
    }

    public List<User> users() { return userRepository.findAll(); }
    
    public Map<String, Object> searchUsers(String query, int page) {
        int pageSize = 5;
        int offset = page * pageSize;
        
        List<User> results;
        int total;
        
        if (query == null || query.isBlank()) {
            results = userRepository.findAll().stream()
                    .skip(offset)
                    .limit(pageSize)
                    .toList();
            total = (int) userRepository.count();
        } else {
            String searchTerm = "%" + query.toLowerCase() + "%";
            results = userRepository.findByNameContainingIgnoreCaseOrMobileNumberContaining(query, query).stream()
                    .skip(offset)
                    .limit(pageSize)
                    .toList();
            total = (int) userRepository.countByNameContainingIgnoreCaseOrMobileNumberContaining(query, query);
        }
        
        int totalPages = (total + pageSize - 1) / pageSize;
        return Map.of(
            "users", results,
            "page", page,
            "totalPages", totalPages,
            "total", total
        );
    }
    
    @Transactional public User updateRole(Long userId, Dtos.RoleUpdateRequest req) { User u = userRepository.findById(userId).orElseThrow(); u.setRole(req.role()); return userRepository.save(u); }

    @Transactional
    public User adjustPoints(Long userId, Dtos.PointsAdjustRequest req, User admin) {
        User u = userRepository.findById(userId).orElseThrow();
        u.setPointsBalance(u.getPointsBalance() + req.pointsDelta());
        userRepository.save(u);
        PointsTransaction pt = new PointsTransaction();
        pt.setUser(u); pt.setType(Enums.PointsTransactionType.ADJUSTMENT); pt.setPoints(req.pointsDelta()); pt.setNote(req.note());
        pointsTransactionRepository.save(pt);
        return u;
    }

    @Transactional
    public Map<String, Object> redeemPoints(User user, Dtos.RedeemRequest req) {
        if (user.getPointsBalance() < req.points()) throw new IllegalArgumentException("Insufficient points");
        user.setPointsBalance(user.getPointsBalance() - req.points());
        userRepository.save(user);
        PointsTransaction pt = new PointsTransaction();
        pt.setUser(user); pt.setType(Enums.PointsTransactionType.REDEEM); pt.setPoints(-req.points()); pt.setNote("Points redeemed");
        pointsTransactionRepository.save(pt);
        return Map.of("pointsBalance", user.getPointsBalance());
    }

    @Transactional
    public Announcement upsertAnnouncement(Long id, Dtos.AnnouncementRequest req, User admin) {
        Announcement a = id == null ? new Announcement() : announcementRepository.findById(id).orElseThrow();
        a.setTitle(req.title()); a.setMessage(req.message()); a.setActive(req.active() == null || req.active()); a.setCreatedBy(admin.getId());
        return announcementRepository.save(a);
    }

    @Transactional public void deleteAnnouncement(Long id) { announcementRepository.deleteById(id); }

    public Map<String, Object> adminDashboard() {
        long users = userRepository.count();
        long txns = paymentRepository.count();
        long totalPoints = userRepository.findAll().stream().mapToLong(User::getPointsBalance).sum();
        return Map.of("totalUsers", users, "totalTransactions", txns, "totalPointsIssued", totalPoints);
    }
}

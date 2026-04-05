package com.margimane.repository;

import com.margimane.model.Enums;
import com.margimane.model.Payment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Payment> findByStatusOrderByCreatedAtAsc(Enums.PaymentStatus status);
    List<Payment> findByUserIdAndStatus(Long userId, Enums.PaymentStatus status);

    @Query("select p from Payment p join fetch p.user where p.status = :status order by p.createdAt asc")
    List<Payment> findByStatusWithUser(@Param("status") Enums.PaymentStatus status);
}

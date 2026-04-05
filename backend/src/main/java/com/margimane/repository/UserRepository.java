package com.margimane.repository;

import com.margimane.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobileNumber(String mobileNumber);
    List<User> findByNameContainingIgnoreCaseOrMobileNumberContaining(String name, String mobileNumber);
    long countByNameContainingIgnoreCaseOrMobileNumberContaining(String name, String mobileNumber);
}

package com.margimane.repository;

import com.margimane.model.MenuItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByActiveTrueOrderByCategoryAscNameAsc();
    List<MenuItem> findAllByOrderByCategoryAscNameAsc();
}

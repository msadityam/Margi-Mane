package com.margimane.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class AppServiceTest {
    @Test
    void shouldCalculatePointsUsingConfiguredRule() {
        int points = AppService.calculateEarnedPoints(250, 100, 10);
        Assertions.assertEquals(20, points);
    }
}

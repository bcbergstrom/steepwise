
package com.steepwise;

import com.steepwise.repository.TeaRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;

import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
@SpringBootTest
class TeaDatabaseIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
        new PostgreSQLContainer("postgres:16");

    @Autowired
    private TeaRepository teaRepository;

    @Test
    void applicationCanConnectToDatabase() {
        assertNotNull(teaRepository);
        assertDoesNotThrow(() -> teaRepository.count());
    }
}

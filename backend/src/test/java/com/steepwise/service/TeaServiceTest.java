
package com.steepwise.service;

import com.steepwise.model.User;
import java.util.List;
import com.steepwise.dto.TeaResponse;
import com.steepwise.dto.TeaRequest;
import com.steepwise.repository.TeaRepository;
import com.steepwise.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeaServiceTest {

    @Mock
    private TeaRepository teaRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private TeaService teaService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    private TeaRequest createRequest(Integer min, Integer max) {
        return new TeaRequest(
            "Dragon Well",             // name
            "Green",                   // teaType
            "China",                   // originCountry
            "Zhejiang",                // originRegion
            2026,                     // harvestYear
            null,                     // harvestSeason
            new BigDecimal("100.00"), // quantityGrams
            min,                      // recommendedTempMinC
            max,                      // recommendedTempMaxC
            "Sweet and nutty"         // notes
        );
    }

    @Test
    void minGreaterThanMax_throwsBadRequest() {

        UUID userId = UUID.randomUUID();
        TeaRequest request = createRequest(95, 75);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> teaService.createTea(userId, request)
        );

        assertEquals(
            HttpStatus.BAD_REQUEST,
            exception.getStatusCode()
        );

        verifyNoInteractions(teaRepository);
    }

    @Test
    void onlyMinProvided_throwsBadRequest() {

        UUID userId = UUID.randomUUID();
        TeaRequest request = createRequest(75, null);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> teaService.createTea(userId, request)
        );

        assertEquals(
            HttpStatus.BAD_REQUEST,
            exception.getStatusCode()
        );

        verifyNoInteractions(teaRepository);
    }

    @Test
    void onlyMaxProvided_throwsBadRequest() {

        UUID userId = UUID.randomUUID();
        TeaRequest request = createRequest(null, 85);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> teaService.createTea(userId, request)
        );

        assertEquals(
            HttpStatus.BAD_REQUEST,
            exception.getStatusCode()
        );

        verifyNoInteractions(teaRepository);
    }

    @Test
    void temperatureAbove100_throwsBadRequest() {

        UUID userId = UUID.randomUUID();
        TeaRequest request = createRequest(90, 105);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> teaService.createTea(userId, request)
        );

        assertEquals(
            HttpStatus.BAD_REQUEST,
            exception.getStatusCode()
        );

        verifyNoInteractions(teaRepository);
    }

    @Test
    void negativeTemperature_throwsBadRequest() {

        UUID userId = UUID.randomUUID();
        TeaRequest request = createRequest(-5, 80);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> teaService.createTea(userId, request)
        );

        assertEquals(
            HttpStatus.BAD_REQUEST,
            exception.getStatusCode()
        );

        verifyNoInteractions(teaRepository);
    }
@Test
void getAllTeas_returnsEmptyListWhenUserHasNoTeas() {

    // Arrange
    when(teaRepository.findByUser_Id(userId))
        .thenReturn(List.of());

    // Act
    List<TeaResponse> result =
        teaService.getAllTeas(userId);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());

    verify(teaRepository, times(1))
        .findByUser_Id(userId);
}
@Test
void getTeaById_teaNotFound_throws404() {

    UUID teaId = UUID.randomUUID();

    when(teaRepository.findByIdAndUser_Id(teaId, userId))
        .thenReturn(Optional.empty());

    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class,
            () -> teaService.getTeaById(userId, teaId)
        );

    assertEquals(
        HttpStatus.NOT_FOUND,
        exception.getStatusCode()
    );
}
@Test
void validTemperatureRange_proceedsToUserLookup() {

    UUID userId = UUID.randomUUID();
    TeaRequest request = createRequest(75, 85);

    when(userRepository.findById(userId))
        .thenReturn(java.util.Optional.empty());

    ResponseStatusException exception = assertThrows(
        ResponseStatusException.class,
        () -> teaService.createTea(userId, request)
    );

    // HTTP 404 confirms temperature validation passed
    // and processing reached the user lookup.
    assertEquals(
        HttpStatus.NOT_FOUND,
        exception.getStatusCode()
    );

    verify(userRepository).findById(userId);
}

}


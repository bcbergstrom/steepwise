
package com.steepwise.service;

import com.steepwise.dto.TeaRequest;
import com.steepwise.dto.TeaResponse;
import com.steepwise.model.Tea;
import com.steepwise.model.User;
import com.steepwise.repository.TeaRepository;
import com.steepwise.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.UUID;

@Service
public class TeaService {

    private final TeaRepository teaRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    // Constructor dependency injection
public TeaService(
    TeaRepository teaRepository,
    UserRepository userRepository,
    EntityManager entityManager
) {
    this.teaRepository = teaRepository;
    this.userRepository = userRepository;
    this.entityManager = entityManager;
}

    // GET: Retrieve all teas owned by a user
    @Transactional(readOnly = true)
    public List<TeaResponse> getAllTeas(UUID userId) {
        return teaRepository.findByUser_Id(userId)
            .stream()
            .map(TeaResponse::from)
            .toList();
    }

    // GET: Retrieve a single tea
    @Transactional(readOnly = true)
    public TeaResponse getTeaById(UUID userId, UUID teaId) {
        Tea tea = findOwnedTea(userId, teaId);
        return TeaResponse.from(tea);
    }

    // POST: Create a new tea
    @Transactional
    public TeaResponse createTea(UUID userId, TeaRequest request) {
                validateTemperatureRange(request);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User not found"
            ));


        Tea tea = new Tea(
            user,
            request.name(),
            request.teaType()
        );

        applyRequest(tea, request);

        Tea savedTea = teaRepository.save(tea);

        // Reload to populate DB-generated createdAt
teaRepository.flush();
entityManager.refresh(savedTea);
        return TeaResponse.from(savedTea);
    }

    // PUT: Update an existing tea
    @Transactional
    public TeaResponse updateTea(
        UUID userId,
        UUID teaId,
        TeaRequest request
    ) {
                validateTemperatureRange(request);

        Tea tea = findOwnedTea(userId, teaId);

        applyRequest(tea, request);

        Tea savedTea = teaRepository.save(tea);

        return TeaResponse.from(savedTea);
    }

    // DELETE: Remove a tea
    @Transactional
    public void deleteTea(UUID userId, UUID teaId) {
        Tea tea = findOwnedTea(userId, teaId);
        teaRepository.delete(tea);
    }

    // Helper: Enforce user ownership
    private Tea findOwnedTea(UUID userId, UUID teaId) {
        return teaRepository
            .findByIdAndUser_Id(teaId, userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Tea not found"
            ));
    }

    // Helper: Copy DTO fields onto entity
    private void applyRequest(Tea tea, TeaRequest request) {
        tea.setName(request.name());
        tea.setTeaType(request.teaType());
        tea.setOriginCountry(request.originCountry());
        tea.setOriginRegion(request.originRegion());
        tea.setHarvestYear(request.harvestYear());
        tea.setHarvestSeason(request.harvestSeason());
        tea.setQuantityGrams(request.quantityGrams());
        tea.setRecommendedTempMinC(request.recommendedTempMinC());
        tea.setRecommendedTempMaxC(request.recommendedTempMaxC());
        tea.setNotes(request.notes());
    }

    // Helper: Check temperature range
    private void validateTemperatureRange(TeaRequest request) {
        Integer min = request.recommendedTempMinC();
        Integer max = request.recommendedTempMaxC();

        if ((min == null) != (max == null)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Both minimum and maximum temperatures are required"
            );
        }
            if (min == null) {
        return;
    }
        if (min < 0 || max > 100) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Temperatures must be between 0 and 100°C"
        );
    }

        if (min != null && min > max) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Minimum temperature cannot exceed maximum"
            );
        }
    }

}


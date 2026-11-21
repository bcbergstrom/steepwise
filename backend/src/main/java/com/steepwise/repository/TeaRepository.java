package com.steepwise.repository;

import com.steepwise.model.Tea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeaRepository extends JpaRepository<Tea, UUID> {

    List<Tea> findByUser_Id(UUID userId);

    Optional<Tea> findByIdAndUser_Id(UUID teaId, UUID userId);
}
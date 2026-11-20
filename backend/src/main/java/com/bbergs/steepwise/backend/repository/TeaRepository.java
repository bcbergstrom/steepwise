package com.steepwise.repository;

import com.steepwise.model.Tea;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeaRepository extends JpaRepository<Tea, Long> {
}
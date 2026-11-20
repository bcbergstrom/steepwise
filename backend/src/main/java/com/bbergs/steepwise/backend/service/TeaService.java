package com.steepwise.service;

import com.steepwise.dto.TeaRequest;
import com.steepwise.model.Tea;
import com.steepwise.repository.TeaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class TeaService {

    private final TeaRepository teaRepository;

    // Spring injects TeaRepository automatically
    public TeaService(TeaRepository teaRepository) {
        this.teaRepository = teaRepository;
    }

    @Transactional(readOnly = true)
    public List<Tea> getAllTeas() {
        return teaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Tea getTeaById(Long id) {
        return teaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Tea not found"
            ));
    }

    @Transactional
    public Tea createTea(TeaRequest request) {
        Tea tea = new Tea(
            request.name(),
            request.type(),
            request.steepTimeSeconds()
        );

        return teaRepository.save(tea);
    }

    @Transactional
    public Tea updateTea(Long id, TeaRequest request) {
        Tea tea = getTeaById(id);

        tea.setName(request.name());
        tea.setType(request.type());
        tea.setSteepTimeSeconds(request.steepTimeSeconds());

        return teaRepository.save(tea);
    }

    @Transactional
    public void deleteTea(Long id) {
        Tea tea = getTeaById(id);
        teaRepository.delete(tea);
    }
}
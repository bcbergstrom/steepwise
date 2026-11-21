
package com.steepwise.controller;

import com.steepwise.service.TeaService;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TeaController.class)
class TeaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TeaService teaService;

    @Test
    void getAllTeas_returns200AndEmptyArray() throws Exception {

        UUID userId = UUID.randomUUID();

        when(teaService.getAllTeas(userId))
            .thenReturn(List.of());

        mockMvc.perform(
                get("/api/users/{userId}/teas", userId)
            )
            .andExpect(status().isOk())
            .andExpect(content().json("[]"));

        verify(teaService).getAllTeas(userId);
    }
    @Test
void getTeaById_notFound_returns404() throws Exception {

    UUID userId = UUID.randomUUID();
    UUID teaId = UUID.randomUUID();

    when(teaService.getTeaById(userId, teaId))
        .thenThrow(new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Tea not found"
        ));

    mockMvc.perform(
            get("/api/users/{userId}/teas/{teaId}",
                userId, teaId)
        )
        .andExpect(status().isNotFound());
}
}

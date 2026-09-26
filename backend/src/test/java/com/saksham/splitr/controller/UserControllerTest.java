package com.saksham.splitr.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saksham.splitr.model.User;
import com.saksham.splitr.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void registerUser_Success() throws Exception {
        User user = new User();
        user.setEmail("test@example.com");
        user.setUsername("TestUser");
        user.setPassword("password123");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("test@example.com")))
                .andExpect(jsonPath("$.username", is("TestUser")));
    }

    @Test
    void registerUser_DuplicateEmail_ReturnsBadRequest() throws Exception {
        User user = new User();
        user.setEmail("duplicate@example.com");
        user.setUsername("User1");
        user.setPassword("pass");
        userRepository.save(user);

        User duplicate = new User();
        duplicate.setEmail("duplicate@example.com");
        duplicate.setUsername("User2");
        duplicate.setPassword("pass");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("already exists")));
    }

    @Test
    void loginUser_ValidCredentials_ReturnsUser() throws Exception {
        User user = new User();
        user.setEmail("login@example.com");
        user.setUsername("LoginUser");
        user.setPassword("securePass");
        userRepository.save(user);

        User loginRequest = new User();
        loginRequest.setEmail("login@example.com");
        loginRequest.setPassword("securePass");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("login@example.com")));
    }

    @Test
    void loginUser_WrongPassword_ReturnsUnauthorized() throws Exception {
        User user = new User();
        user.setEmail("wrong@example.com");
        user.setUsername("WrongUser");
        user.setPassword("correctPass");
        userRepository.save(user);

        User loginRequest = new User();
        loginRequest.setEmail("wrong@example.com");
        loginRequest.setPassword("wrongPass");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("Invalid credentials")));
    }
}

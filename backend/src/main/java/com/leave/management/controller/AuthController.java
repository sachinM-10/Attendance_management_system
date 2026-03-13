package com.leave.management.controller;

import com.leave.management.dto.JwtResponseDTO;
import com.leave.management.dto.LoginRequestDTO;
import com.leave.management.dto.RegisterRequestDTO;
import com.leave.management.entity.Employee;
import com.leave.management.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponseDTO> authenticateUser(@Valid @RequestBody LoginRequestDTO loginRequest) {
        JwtResponseDTO jwtResponse = authService.login(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        Employee employee = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully with email: " + employee.getEmail());
    }
}

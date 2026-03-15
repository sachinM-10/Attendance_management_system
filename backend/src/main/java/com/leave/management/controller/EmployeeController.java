package com.leave.management.controller;

import com.leave.management.dto.EmployeeDTO;
import com.leave.management.security.UserDetailsImpl;
import com.leave.management.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeDTO> getCurrentEmployee(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        EmployeeDTO employeeDTO = employeeService.getEmployeeById(userDetails.getId());
        return ResponseEntity.ok(employeeDTO);
    }

    @GetMapping
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping("/team")
    public ResponseEntity<List<EmployeeDTO>> getMyTeam(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(employeeService.getEmployeesByManager(userDetails.getId()));
    }
}

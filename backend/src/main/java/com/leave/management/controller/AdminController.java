package com.leave.management.controller;

import com.leave.management.dto.EmployeeDTO;
import com.leave.management.dto.LeaveTypeDTO;
import com.leave.management.dto.RegisterRequestDTO;
import com.leave.management.entity.LeaveType;
import com.leave.management.repository.LeaveTypeRepository;
import com.leave.management.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final EmployeeService employeeService;
    private final LeaveTypeRepository leaveTypeRepository;

    public AdminController(EmployeeService employeeService, LeaveTypeRepository leaveTypeRepository) {
        this.employeeService = employeeService;
        this.leaveTypeRepository = leaveTypeRepository;
    }

    @PostMapping("/employees")
    public ResponseEntity<EmployeeDTO> createEmployee(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.createEmployee(request));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<EmployeeDTO> updateEmployee(@PathVariable Long id, @Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deactivateEmployee(@PathVariable Long id) {
        employeeService.deactivateEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/leave-types")
    public ResponseEntity<List<LeaveType>> getLeaveTypes() {
        return ResponseEntity.ok(leaveTypeRepository.findAll());
    }

    @PostMapping("/leave-types")
    public ResponseEntity<LeaveType> createLeaveType(@Valid @RequestBody LeaveTypeDTO dto) {
        LeaveType type = LeaveType.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .defaultDaysPerYear(dto.getDefaultDaysPerYear())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveTypeRepository.save(type));
    }
}

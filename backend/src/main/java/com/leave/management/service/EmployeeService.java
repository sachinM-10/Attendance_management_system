package com.leave.management.service;

import com.leave.management.dto.EmployeeDTO;
import com.leave.management.dto.RegisterRequestDTO;
import com.leave.management.entity.Department;
import com.leave.management.entity.Employee;
import com.leave.management.entity.LeaveType;
import com.leave.management.entity.LeaveBalance;
import com.leave.management.entity.Role;
import com.leave.management.exception.BadRequestException;
import com.leave.management.exception.ResourceNotFoundException;
import com.leave.management.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           LeaveTypeRepository leaveTypeRepository,
                           LeaveBalanceRepository leaveBalanceRepository,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToDTO(employee);
    }

    public EmployeeDTO getEmployeeByEmail(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));
        return mapToDTO(employee);
    }

    public List<EmployeeDTO> getEmployeesByManager(Long managerId) {
        return employeeRepository.findByManagerId(managerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeDTO createEmployee(RegisterRequestDTO request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        Department dept = null;
        if (request.getDepartmentId() != null) {
            dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        }

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + request.getManagerId()));
        }

        Employee emp = Employee.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE)
                .jobTitle(request.getJobTitle())
                .department(dept)
                .manager(manager)
                .active(true)
                .build();

        Employee saved = employeeRepository.save(emp);

        // Seed leave balances for current year
        int currentYear = LocalDate.now().getYear();
        List<LeaveType> leaveTypes = leaveTypeRepository.findAll();
        for (LeaveType lt : leaveTypes) {
            LeaveBalance lb = LeaveBalance.builder()
                    .employee(saved)
                    .leaveType(lt)
                    .totalDays(lt.getDefaultDaysPerYear())
                    .usedDays(0)
                    .year(currentYear)
                    .build();
            leaveBalanceRepository.save(lb);
        }

        return mapToDTO(saved);
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, RegisterRequestDTO request) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (!emp.getEmail().equalsIgnoreCase(request.getEmail()) && employeeRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use by another user!");
        }

        emp.setFirstName(request.getFirstName());
        emp.setLastName(request.getLastName());
        emp.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            emp.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            emp.setRole(request.getRole());
        }
        if (request.getJobTitle() != null) {
            emp.setJobTitle(request.getJobTitle());
        }

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            emp.setDepartment(dept);
        }

        if (request.getManagerId() != null) {
            Employee mgr = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            emp.setManager(mgr);
        }

        Employee updated = employeeRepository.save(emp);
        return mapToDTO(updated);
    }

    @Transactional
    public void deactivateEmployee(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        emp.setActive(false);
        employeeRepository.save(emp);
    }

    public EmployeeDTO mapToDTO(Employee emp) {
        return EmployeeDTO.builder()
                .id(emp.getId())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .email(emp.getEmail())
                .role(emp.getRole())
                .jobTitle(emp.getJobTitle())
                .departmentId(emp.getDepartment() != null ? emp.getDepartment().getId() : null)
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .managerId(emp.getManager() != null ? emp.getManager().getId() : null)
                .managerName(emp.getManager() != null ? emp.getManager().getFirstName() + " " + emp.getManager().getLastName() : null)
                .active(emp.isActive())
                .createdAt(emp.getCreatedAt())
                .build();
    }
}

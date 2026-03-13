package com.leave.management.service;

import com.leave.management.dto.JwtResponseDTO;
import com.leave.management.dto.LoginRequestDTO;
import com.leave.management.dto.RegisterRequestDTO;
import com.leave.management.entity.*;
import com.leave.management.exception.BadRequestException;
import com.leave.management.repository.*;
import com.leave.management.security.JwtUtils;
import com.leave.management.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager,
                       EmployeeRepository employeeRepository,
                       DepartmentRepository departmentRepository,
                       LeaveTypeRepository leaveTypeRepository,
                       LeaveBalanceRepository leaveBalanceRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public JwtResponseDTO login(LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Employee employee = employeeRepository.findById(userDetails.getId())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        return JwtResponseDTO.builder()
                .token(jwt)
                .id(employee.getId())
                .email(employee.getEmail())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .role(employee.getRole().name())
                .jobTitle(employee.getJobTitle())
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null)
                .managerId(employee.getManager() != null ? employee.getManager().getId() : null)
                .managerName(employee.getManager() != null ? employee.getManager().getFirstName() + " " + employee.getManager().getLastName() : null)
                .build();
    }

    @Transactional
    public Employee register(RegisterRequestDTO registerRequest) {
        if (employeeRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        Department department = null;
        if (registerRequest.getDepartmentId() != null) {
            department = departmentRepository.findById(registerRequest.getDepartmentId())
                    .orElse(null);
        }

        Employee manager = null;
        if (registerRequest.getManagerId() != null) {
            manager = employeeRepository.findById(registerRequest.getManagerId())
                    .orElse(null);
        }

        Role role = registerRequest.getRole() != null ? registerRequest.getRole() : Role.ROLE_EMPLOYEE;

        Employee employee = Employee.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(role)
                .jobTitle(registerRequest.getJobTitle() != null ? registerRequest.getJobTitle() : "Employee")
                .department(department)
                .manager(manager)
                .active(true)
                .build();

        Employee savedEmployee = employeeRepository.save(employee);

        // Initialize leave balances for the newly registered employee
        List<LeaveType> leaveTypes = leaveTypeRepository.findAll();
        int currentYear = LocalDate.now().getYear();

        for (LeaveType lt : leaveTypes) {
            LeaveBalance balance = LeaveBalance.builder()
                    .employee(savedEmployee)
                    .leaveType(lt)
                    .totalDays(lt.getDefaultDaysPerYear())
                    .usedDays(0)
                    .year(currentYear)
                    .build();
            leaveBalanceRepository.save(balance);
        }

        return savedEmployee;
    }
}

package com.leave.management.service;

import com.leave.management.dto.*;
import com.leave.management.entity.*;
import com.leave.management.entity.LeaveRequest.Status;
import com.leave.management.exception.BadRequestException;
import com.leave.management.exception.InsufficientBalanceException;
import com.leave.management.exception.ResourceNotFoundException;
import com.leave.management.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
                        LeaveTypeRepository leaveTypeRepository,
                        LeaveBalanceRepository leaveBalanceRepository,
                        EmployeeRepository employeeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public LeaveResponseDTO applyForLeave(Long employeeId, LeaveRequestDTO requestDTO) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        LeaveType leaveType = leaveTypeRepository.findById(requestDTO.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found with id: " + requestDTO.getLeaveTypeId()));

        LocalDate startDate = requestDTO.getStartDate();
        LocalDate endDate = requestDTO.getEndDate();

        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        // Calculate days (inclusive)
        int requestedDays = (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (requestedDays <= 0) {
            throw new BadRequestException("Invalid leave duration");
        }

        // Check for overlapping pending or approved leave requests
        List<LeaveRequest> overlapping = leaveRequestRepository.findOverlappingRequests(employeeId, startDate, endDate);
        if (!overlapping.isEmpty()) {
            throw new BadRequestException("You already have an active or pending leave request overlapping with these dates!");
        }

        // Check leave balance for current year
        int currentYear = startDate.getYear();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveType.getId(), currentYear)
                .orElseGet(() -> {
                    // Create balance record if not exists
                    LeaveBalance newBalance = LeaveBalance.builder()
                            .employee(employee)
                            .leaveType(leaveType)
                            .totalDays(leaveType.getDefaultDaysPerYear())
                            .usedDays(0)
                            .year(currentYear)
                            .build();
                    return leaveBalanceRepository.save(newBalance);
                });

        if (balance.getRemainingDays() < requestedDays) {
            throw new InsufficientBalanceException("Insufficient " + leaveType.getName() + " balance! Requested: " + requestedDays + " days, Remaining: " + balance.getRemainingDays() + " days.");
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveType)
                .startDate(startDate)
                .endDate(endDate)
                .totalDays(requestedDays)
                .reason(requestDTO.getReason())
                .status(Status.PENDING)
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToDTO(saved);
    }

    public List<LeaveResponseDTO> getMyLeaveHistory(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByAppliedAtDesc(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveResponseDTO> getPendingRequestsForManager(Long managerId, String role) {
        if (Role.ROLE_ADMIN.name().equals(role)) {
            return leaveRequestRepository.findByStatus(Status.PENDING).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        return leaveRequestRepository.findByManagerIdAndStatus(managerId, Status.PENDING).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveResponseDTO> getAllLeaveRequestsForManager(Long managerId, String role) {
        if (Role.ROLE_ADMIN.name().equals(role)) {
            return leaveRequestRepository.findAll().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        return leaveRequestRepository.findByManagerId(managerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveResponseDTO approveLeaveRequest(Long leaveRequestId, Long reviewerId, String reviewerRole, LeaveReviewDTO reviewDTO) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveRequestId));

        if (leaveRequest.getStatus() != Status.PENDING) {
            throw new BadRequestException("Leave request is already " + leaveRequest.getStatus());
        }

        // Authorization check: Must be manager of the employee or admin
        Employee employee = leaveRequest.getEmployee();
        if (!Role.ROLE_ADMIN.name().equals(reviewerRole)) {
            if (employee.getManager() == null || !employee.getManager().getId().equals(reviewerId)) {
                throw new AccessDeniedException("You are not authorized to approve leave requests for this employee!");
            }
        }

        // Update leave balance
        int leaveYear = leaveRequest.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), leaveRequest.getLeaveType().getId(), leaveYear)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance record not found"));

        if (balance.getRemainingDays() < leaveRequest.getTotalDays()) {
            throw new InsufficientBalanceException("Employee no longer has sufficient leave balance for this request.");
        }

        balance.setUsedDays(balance.getUsedDays() + leaveRequest.getTotalDays());
        leaveBalanceRepository.save(balance);

        leaveRequest.setStatus(Status.APPROVED);
        leaveRequest.setManagerComment(reviewDTO != null ? reviewDTO.getComment() : "Approved");
        leaveRequest.setReviewedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapToDTO(updated);
    }

    @Transactional
    public LeaveResponseDTO rejectLeaveRequest(Long leaveRequestId, Long reviewerId, String reviewerRole, LeaveReviewDTO reviewDTO) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveRequestId));

        if (leaveRequest.getStatus() != Status.PENDING) {
            throw new BadRequestException("Leave request is already " + leaveRequest.getStatus());
        }

        Employee employee = leaveRequest.getEmployee();
        if (!Role.ROLE_ADMIN.name().equals(reviewerRole)) {
            if (employee.getManager() == null || !employee.getManager().getId().equals(reviewerId)) {
                throw new AccessDeniedException("You are not authorized to reject leave requests for this employee!");
            }
        }

        leaveRequest.setStatus(Status.REJECTED);
        leaveRequest.setManagerComment(reviewDTO != null ? reviewDTO.getComment() : "Rejected");
        leaveRequest.setReviewedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapToDTO(updated);
    }

    @Transactional
    public LeaveResponseDTO cancelLeaveRequest(Long leaveRequestId, Long employeeId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveRequestId));

        if (!leaveRequest.getEmployee().getId().equals(employeeId)) {
            throw new AccessDeniedException("You can only cancel your own leave requests!");
        }

        if (leaveRequest.getStatus() != Status.PENDING) {
            throw new BadRequestException("Only pending leave requests can be cancelled!");
        }

        leaveRequest.setStatus(Status.CANCELLED);
        leaveRequest.setReviewedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapToDTO(updated);
    }

    public List<LeaveBalanceDTO> getLeaveBalances(Long employeeId) {
        int currentYear = LocalDate.now().getYear();
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, currentYear);

        // If missing balances, auto-create for all leave types
        if (balances.isEmpty()) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            List<LeaveType> leaveTypes = leaveTypeRepository.findAll();
            for (LeaveType lt : leaveTypes) {
                LeaveBalance lb = LeaveBalance.builder()
                        .employee(employee)
                        .leaveType(lt)
                        .totalDays(lt.getDefaultDaysPerYear())
                        .usedDays(0)
                        .year(currentYear)
                        .build();
                leaveBalanceRepository.save(lb);
            }
            balances = leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, currentYear);
        }

        return balances.stream()
                .map(this::mapToBalanceDTO)
                .collect(Collectors.toList());
    }

    public LeaveResponseDTO mapToDTO(LeaveRequest request) {
        Employee emp = request.getEmployee();
        return LeaveResponseDTO.builder()
                .id(request.getId())
                .employeeId(emp.getId())
                .employeeName(emp.getFirstName() + " " + emp.getLastName())
                .employeeEmail(emp.getEmail())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .leaveTypeId(request.getLeaveType().getId())
                .leaveTypeName(request.getLeaveType().getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(request.getTotalDays())
                .reason(request.getReason())
                .status(request.getStatus())
                .managerComment(request.getManagerComment())
                .appliedAt(request.getAppliedAt())
                .reviewedAt(request.getReviewedAt())
                .build();
    }

    public LeaveBalanceDTO mapToBalanceDTO(LeaveBalance balance) {
        Employee emp = balance.getEmployee();
        return LeaveBalanceDTO.builder()
                .id(balance.getId())
                .employeeId(emp.getId())
                .employeeName(emp.getFirstName() + " " + emp.getLastName())
                .leaveTypeId(balance.getLeaveType().getId())
                .leaveTypeName(balance.getLeaveType().getName())
                .totalDays(balance.getTotalDays())
                .usedDays(balance.getUsedDays())
                .remainingDays(balance.getRemainingDays())
                .year(balance.getYear())
                .build();
    }
}

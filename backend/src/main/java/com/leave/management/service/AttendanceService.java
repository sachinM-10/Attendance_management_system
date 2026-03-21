package com.leave.management.service;

import com.leave.management.dto.AttendanceDTO;
import com.leave.management.dto.DashboardSummaryDTO;

import com.leave.management.entity.Attendance;
import com.leave.management.entity.Attendance.Status;
import com.leave.management.entity.Employee;
import com.leave.management.entity.LeaveRequest;
import com.leave.management.entity.Role;
import com.leave.management.exception.BadRequestException;
import com.leave.management.exception.ResourceNotFoundException;
import com.leave.management.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveService leaveService;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeRepository employeeRepository,
                             DepartmentRepository departmentRepository,
                             LeaveRequestRepository leaveRequestRepository,
                             LeaveService leaveService) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveService = leaveService;
    }

    @Transactional
    public AttendanceDTO checkIn(Long employeeId) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (existing.isPresent()) {
            Attendance attendance = existing.get();
            if (attendance.getCheckInTime() != null) {
                throw new BadRequestException("You have already checked in today at " + attendance.getCheckInTime());
            }
            attendance.setCheckInTime(now);
            attendance.setStatus(now.isAfter(LocalTime.of(9, 30)) ? Status.LATE : Status.PRESENT);
            return mapToDTO(attendanceRepository.save(attendance));
        }

        Status status = now.isAfter(LocalTime.of(9, 30)) ? Status.LATE : Status.PRESENT;

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(today)
                .checkInTime(now)
                .status(status)
                .notes("Checked in via Web Application")
                .build();

        return mapToDTO(attendanceRepository.save(attendance));
    }

    @Transactional
    public AttendanceDTO checkOut(Long employeeId) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new BadRequestException("You must check in before checking out!"));

        if (attendance.getCheckOutTime() != null) {
            throw new BadRequestException("You have already checked out today at " + attendance.getCheckOutTime());
        }

        attendance.setCheckOutTime(now);
        return mapToDTO(attendanceRepository.save(attendance));
    }

    public List<AttendanceDTO> getMyAttendance(Long employeeId) {
        return attendanceRepository.findByEmployeeIdOrderByDateDesc(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getTeamAttendance(Long managerId, String role) {
        if (Role.ROLE_ADMIN.name().equals(role)) {
            return attendanceRepository.findAll().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        return attendanceRepository.findByManagerId(managerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AttendanceDTO getTodayAttendance(Long employeeId) {
        LocalDate today = LocalDate.now();
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .map(this::mapToDTO)
                .orElse(null);
    }

    public DashboardSummaryDTO getDashboardSummary(Long userId, String role) {
        LocalDate today = LocalDate.now();

        long totalEmployees = employeeRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalManagers = employeeRepository.countByRole(Role.ROLE_MANAGER);

        long pendingLeaves = leaveRequestRepository.countByStatus(LeaveRequest.Status.PENDING);
        long approvedLeaves = leaveRequestRepository.countByStatus(LeaveRequest.Status.APPROVED);
        long rejectedLeaves = leaveRequestRepository.countByStatus(LeaveRequest.Status.REJECTED);

        long presentToday = attendanceRepository.countByDateAndStatus(today, Status.PRESENT) +
                attendanceRepository.countByDateAndStatus(today, Status.LATE);
        long onLeaveToday = attendanceRepository.countByDateAndStatus(today, Status.ON_LEAVE);

        AttendanceDTO todayAttendance = getTodayAttendance(userId);

        return DashboardSummaryDTO.builder()
                .totalEmployees(totalEmployees)
                .totalDepartments(totalDepartments)
                .totalManagers(totalManagers)
                .pendingLeavesCount(pendingLeaves)
                .approvedLeavesCount(approvedLeaves)
                .rejectedLeavesCount(rejectedLeaves)
                .presentTodayCount(presentToday)
                .onLeaveTodayCount(onLeaveToday)
                .leaveBalances(leaveService.getLeaveBalances(userId))
                .recentLeaveRequests(leaveService.getMyLeaveHistory(userId))
                .todayAttendance(todayAttendance)
                .build();
    }

    public AttendanceDTO mapToDTO(Attendance attendance) {
        Employee emp = attendance.getEmployee();
        return AttendanceDTO.builder()
                .id(attendance.getId())
                .employeeId(emp.getId())
                .employeeName(emp.getFirstName() + " " + emp.getLastName())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .date(attendance.getDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus())
                .notes(attendance.getNotes())
                .build();
    }
}

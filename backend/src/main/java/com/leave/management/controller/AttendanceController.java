package com.leave.management.controller;

import com.leave.management.dto.AttendanceDTO;
import com.leave.management.dto.DashboardSummaryDTO;
import com.leave.management.security.UserDetailsImpl;
import com.leave.management.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceDTO> checkIn(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(attendanceService.checkIn(userDetails.getId()));
    }

    @PostMapping("/check-out")
    public ResponseEntity<AttendanceDTO> checkOut(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(attendanceService.checkOut(userDetails.getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<AttendanceDTO>> getMyAttendance(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(attendanceService.getMyAttendance(userDetails.getId()));
    }

    @GetMapping("/today")
    public ResponseEntity<AttendanceDTO> getTodayAttendance(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(attendanceService.getTodayAttendance(userDetails.getId()));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<AttendanceDTO>> getTeamAttendance(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        String role = userDetails.getAuthorities().stream().findFirst().map(GrantedAuthority::getAuthority).orElse("");
        return ResponseEntity.ok(attendanceService.getTeamAttendance(userDetails.getId(), role));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        String role = userDetails.getAuthorities().stream().findFirst().map(GrantedAuthority::getAuthority).orElse("");
        return ResponseEntity.ok(attendanceService.getDashboardSummary(userDetails.getId(), role));
    }
}

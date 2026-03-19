package com.leave.management.controller;

import com.leave.management.dto.*;
import com.leave.management.security.UserDetailsImpl;
import com.leave.management.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    public ResponseEntity<LeaveResponseDTO> applyForLeave(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                          @Valid @RequestBody LeaveRequestDTO requestDTO) {
        LeaveResponseDTO response = leaveService.applyForLeave(userDetails.getId(), requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<LeaveResponseDTO>> getMyLeaveHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(leaveService.getMyLeaveHistory(userDetails.getId()));
    }

    @GetMapping("/balances")
    public ResponseEntity<List<LeaveBalanceDTO>> getMyLeaveBalances(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(leaveService.getLeaveBalances(userDetails.getId()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<LeaveResponseDTO>> getPendingLeaveRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        String role = userDetails.getAuthorities().stream().findFirst().map(GrantedAuthority::getAuthority).orElse("");
        return ResponseEntity.ok(leaveService.getPendingRequestsForManager(userDetails.getId(), role));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<LeaveResponseDTO>> getTeamLeaveRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        String role = userDetails.getAuthorities().stream().findFirst().map(GrantedAuthority::getAuthority).orElse("");
        return ResponseEntity.ok(leaveService.getAllLeaveRequestsForManager(userDetails.getId(), role));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<LeaveResponseDTO> approveLeaveRequest(@PathVariable Long id,
                                                                 @AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                 @RequestBody(required = false) LeaveReviewDTO reviewDTO) {
        String role = userDetails.getAuthorities().stream().findFirst().map(GrantedAuthority::getAuthority).orElse("");
        return ResponseEntity.ok(leaveService.approveLeaveRequest(id, userDetails.getId(), role, reviewDTO));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<LeaveResponseDTO> rejectLeaveRequest(@PathVariable Long id,
                                                                @AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                @RequestBody(required = false) LeaveReviewDTO reviewDTO) {
        String role = userDetails.getAuthorities().stream().findFirst().map(GrantedAuthority::getAuthority).orElse("");
        return ResponseEntity.ok(leaveService.rejectLeaveRequest(id, userDetails.getId(), role, reviewDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<LeaveResponseDTO> cancelLeaveRequest(@PathVariable Long id,
                                                                @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(leaveService.cancelLeaveRequest(id, userDetails.getId()));
    }
}

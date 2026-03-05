package com.leave.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDTO {
    private long totalEmployees;
    private long totalDepartments;
    private long totalManagers;
    private long pendingLeavesCount;
    private long approvedLeavesCount;
    private long rejectedLeavesCount;
    private long presentTodayCount;
    private long onLeaveTodayCount;
    private List<LeaveBalanceDTO> leaveBalances;
    private List<LeaveResponseDTO> recentLeaveRequests;
    private AttendanceDTO todayAttendance;
}

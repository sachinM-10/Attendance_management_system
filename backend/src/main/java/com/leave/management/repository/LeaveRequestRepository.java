package com.leave.management.repository;

import com.leave.management.entity.LeaveRequest;
import com.leave.management.entity.LeaveRequest.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeIdOrderByAppliedAtDesc(Long employeeId);
    List<LeaveRequest> findByStatus(Status status);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.manager.id = :managerId ORDER BY l.appliedAt DESC")
    List<LeaveRequest> findByManagerId(@Param("managerId") Long managerId);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.manager.id = :managerId AND l.status = :status ORDER BY l.appliedAt DESC")
    List<LeaveRequest> findByManagerIdAndStatus(@Param("managerId") Long managerId, @Param("status") Status status);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId AND l.status IN ('PENDING', 'APPROVED') AND " +
           "((l.startDate <= :endDate AND l.endDate >= :startDate))")
    List<LeaveRequest> findOverlappingRequests(@Param("employeeId") Long employeeId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);

    long countByStatus(Status status);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.employee.manager.id = :managerId AND l.status = :status")
    long countByManagerIdAndStatus(@Param("managerId") Long managerId, @Param("status") Status status);
}

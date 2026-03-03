package com.leave.management.repository;

import com.leave.management.entity.Attendance;
import com.leave.management.entity.Attendance.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
    List<Attendance> findByEmployeeIdOrderByDateDesc(Long employeeId);
    List<Attendance> findByDate(LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.employee.manager.id = :managerId AND a.date = :date")
    List<Attendance> findByManagerIdAndDate(@Param("managerId") Long managerId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.employee.manager.id = :managerId ORDER BY a.date DESC")
    List<Attendance> findByManagerId(@Param("managerId") Long managerId);

    long countByDateAndStatus(LocalDate date, Status status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee.manager.id = :managerId AND a.date = :date AND a.status = :status")
    long countByManagerIdAndDateAndStatus(@Param("managerId") Long managerId, @Param("date") LocalDate date, @Param("status") Status status);
}

package com.leave.management.repository;

import com.leave.management.entity.Employee;
import com.leave.management.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<Employee> findByManagerId(Long managerId);
    List<Employee> findByDepartmentId(Long departmentId);
    List<Employee> findByRole(Role role);
    long countByRole(Role role);
}

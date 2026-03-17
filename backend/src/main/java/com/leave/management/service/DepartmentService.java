package com.leave.management.service;

import com.leave.management.dto.DepartmentDTO;
import com.leave.management.entity.Department;
import com.leave.management.entity.Employee;
import com.leave.management.exception.BadRequestException;
import com.leave.management.exception.ResourceNotFoundException;
import com.leave.management.repository.DepartmentRepository;
import com.leave.management.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentService(DepartmentRepository departmentRepository, EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DepartmentDTO getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return mapToDTO(dept);
    }

    @Transactional
    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name already exists");
        }
        if (departmentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Department code already exists");
        }

        Employee manager = null;
        if (dto.getManagerId() != null) {
            manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        }

        Department dept = Department.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .description(dto.getDescription())
                .manager(manager)
                .build();

        Department saved = departmentRepository.save(dept);
        return mapToDTO(saved);
    }

    @Transactional
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (!dept.getName().equalsIgnoreCase(dto.getName()) && departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name already exists");
        }
        if (!dept.getCode().equalsIgnoreCase(dto.getCode()) && departmentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Department code already exists");
        }

        dept.setName(dto.getName());
        dept.setCode(dto.getCode());
        dept.setDescription(dto.getDescription());

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            dept.setManager(manager);
        } else {
            dept.setManager(null);
        }

        Department updated = departmentRepository.save(dept);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        departmentRepository.delete(dept);
    }

    public DepartmentDTO mapToDTO(Department dept) {
        int empCount = employeeRepository.findByDepartmentId(dept.getId()).size();
        return DepartmentDTO.builder()
                .id(dept.getId())
                .name(dept.getName())
                .code(dept.getCode())
                .description(dept.getDescription())
                .managerId(dept.getManager() != null ? dept.getManager().getId() : null)
                .managerName(dept.getManager() != null ? dept.getManager().getFirstName() + " " + dept.getManager().getLastName() : null)
                .employeeCount(empCount)
                .build();
    }
}

package com.leave.management.dto;

import com.leave.management.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private String jobTitle;
    private Long departmentId;
    private String departmentName;
    private Long managerId;
    private String managerName;
    private boolean active;
    private LocalDateTime createdAt;
}

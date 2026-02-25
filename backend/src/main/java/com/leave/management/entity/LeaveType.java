package com.leave.management.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. Casual Leave, Sick Leave, Earned Leave, Other

    private String description;

    @Column(nullable = false)
    private Integer defaultDaysPerYear;
}

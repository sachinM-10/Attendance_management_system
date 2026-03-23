package com.leave.management.config;

import com.leave.management.entity.*;
import com.leave.management.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           LeaveTypeRepository leaveTypeRepository,
                           LeaveBalanceRepository leaveBalanceRepository,
                           AttendanceRepository attendanceRepository,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.attendanceRepository = attendanceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing baseline system data...");

        // 1. Seed Leave Types if empty
        if (leaveTypeRepository.count() == 0) {
            LeaveType casual = LeaveType.builder()
                    .name("Casual Leave")
                    .description("Short leave taken for personal matters")
                    .defaultDaysPerYear(12)
                    .build();

            LeaveType sick = LeaveType.builder()
                    .name("Sick Leave")
                    .description("Leave taken due to illness or medical appointment")
                    .defaultDaysPerYear(10)
                    .build();

            LeaveType earned = LeaveType.builder()
                    .name("Earned Leave")
                    .description("Annual paid vacation leave")
                    .defaultDaysPerYear(15)
                    .build();

            LeaveType other = LeaveType.builder()
                    .name("Other")
                    .description("Special permissions or unspecified leave")
                    .defaultDaysPerYear(5)
                    .build();

            leaveTypeRepository.saveAll(Arrays.asList(casual, sick, earned, other));
            logger.info("Seeded 4 Leave Types.");
        }

        // 2. Seed Departments if empty
        if (departmentRepository.count() == 0) {
            Department eng = Department.builder()
                    .name("Engineering")
                    .code("ENG")
                    .description("Software Development and Systems Engineering")
                    .build();

            Department hr = Department.builder()
                    .name("Human Resources")
                    .code("HR")
                    .description("People Operations and Talent Acquisition")
                    .build();

            Department mkt = Department.builder()
                    .name("Sales & Marketing")
                    .code("MKT")
                    .description("Business Development and Product Marketing")
                    .build();

            Department fin = Department.builder()
                    .name("Finance")
                    .code("FIN")
                    .description("Accounting, Payroll and Financial Planning")
                    .build();

            departmentRepository.saveAll(Arrays.asList(eng, hr, mkt, fin));
            logger.info("Seeded 4 Departments.");
        }

        // 3. Seed Initial Demo Users if no users exist
        if (employeeRepository.count() == 0) {
            Department engDept = departmentRepository.findByCode("ENG").orElse(null);
            Department hrDept = departmentRepository.findByCode("HR").orElse(null);

            // Admin
            Employee admin = Employee.builder()
                    .firstName("System")
                    .lastName("Admin")
                    .email("admin@company.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ROLE_ADMIN)
                    .jobTitle("System Administrator")
                    .department(hrDept)
                    .active(true)
                    .build();
            admin = employeeRepository.save(admin);

            // Manager
            Employee manager = Employee.builder()
                    .firstName("Sarah")
                    .lastName("Manager")
                    .email("manager@company.com")
                    .password(passwordEncoder.encode("Manager@123"))
                    .role(Role.ROLE_MANAGER)
                    .jobTitle("Engineering Director")
                    .department(engDept)
                    .active(true)
                    .build();
            manager = employeeRepository.save(manager);

            // Link manager to department
            if (engDept != null) {
                engDept.setManager(manager);
                departmentRepository.save(engDept);
            }

            // Employee
            Employee employee = Employee.builder()
                    .firstName("Alex")
                    .lastName("Employee")
                    .email("employee@company.com")
                    .password(passwordEncoder.encode("Employee@123"))
                    .role(Role.ROLE_EMPLOYEE)
                    .jobTitle("Full Stack Developer")
                    .department(engDept)
                    .manager(manager)
                    .active(true)
                    .build();
            employee = employeeRepository.save(employee);

            logger.info("Seeded Admin (admin@company.com), Manager (manager@company.com), Employee (employee@company.com).");

            // 4. Seed Leave Balances for Manager and Employee
            List<LeaveType> leaveTypes = leaveTypeRepository.findAll();
            int currentYear = LocalDate.now().getYear();

            for (Employee emp : Arrays.asList(admin, manager, employee)) {
                for (LeaveType lt : leaveTypes) {
                    LeaveBalance lb = LeaveBalance.builder()
                            .employee(emp)
                            .leaveType(lt)
                            .totalDays(lt.getDefaultDaysPerYear())
                            .usedDays(0)
                            .year(currentYear)
                            .build();
                    leaveBalanceRepository.save(lb);
                }
            }
            logger.info("Seeded Leave Balances for year {}", currentYear);

            // 5. Seed today's attendance for employee
            Attendance todayAttendance = Attendance.builder()
                    .employee(employee)
                    .date(LocalDate.now())
                    .checkInTime(LocalTime.of(9, 0))
                    .status(Attendance.Status.PRESENT)
                    .notes("Regular check-in")
                    .build();
            attendanceRepository.save(todayAttendance);
            logger.info("Seeded initial attendance record for employee.");
        }

        logger.info("Data initialization complete!");
    }
}

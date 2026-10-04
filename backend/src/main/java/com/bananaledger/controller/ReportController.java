package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.DashboardDto;
import com.bananaledger.dto.MonthlyReportDto;
import com.bananaledger.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboard() {
        DashboardDto dashboard = reportService.getDashboard();
        return ResponseEntity.ok(ApiResponse.ok(dashboard));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<MonthlyReportDto>> getMonthlyReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        if (year == null) year = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        MonthlyReportDto report = reportService.getMonthlyReport(year, month);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }
}

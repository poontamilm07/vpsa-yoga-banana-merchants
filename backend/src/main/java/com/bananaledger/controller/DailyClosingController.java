package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.DailyClosingRequest;
import com.bananaledger.dto.DailyReportDto;
import com.bananaledger.entity.DailyClosing;
import com.bananaledger.service.DailyClosingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/daily-closing")
public class DailyClosingController {

    private final DailyClosingService dailyClosingService;

    public DailyClosingController(DailyClosingService dailyClosingService) {
        this.dailyClosingService = dailyClosingService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DailyReportDto>> getDailySummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        DailyReportDto summary = dailyClosingService.getDailySummary(date);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getClosingStatus(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        boolean isClosed = dailyClosingService.isDayClosed(date);
        Map<String, Object> map = new HashMap<>();
        map.put("date", date);
        map.put("isClosed", isClosed);
        return ResponseEntity.ok(ApiResponse.ok(map));
    }

    @PostMapping("/close")
    public ResponseEntity<ApiResponse<DailyClosing>> closeDay(@Valid @RequestBody DailyClosingRequest request) {
        DailyClosing closing = dailyClosingService.closeDay(request);
        return ResponseEntity.ok(ApiResponse.ok("Day closed successfully", closing));
    }
}

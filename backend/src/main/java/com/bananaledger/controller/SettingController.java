package com.bananaledger.controller;

import com.bananaledger.dto.ApiResponse;
import com.bananaledger.dto.SettingRequest;
import com.bananaledger.entity.BusinessSetting;
import com.bananaledger.repository.BusinessSettingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingController {

    private final BusinessSettingRepository settingRepository;

    public SettingController(BusinessSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getSettings() {
        List<BusinessSetting> list = settingRepository.findAll();
        Map<String, String> map = new HashMap<>();
        for (BusinessSetting s : list) {
            map.put(s.getKey(), s.getValue());
        }
        return ResponseEntity.ok(ApiResponse.ok(map));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> saveSettings(@RequestBody SettingRequest request) {
        if (request.getSettings() != null) {
            for (Map.Entry<String, String> entry : request.getSettings().entrySet()) {
                settingRepository.save(new BusinessSetting(entry.getKey(), entry.getValue()));
            }
        }
        return getSettings();
    }
}

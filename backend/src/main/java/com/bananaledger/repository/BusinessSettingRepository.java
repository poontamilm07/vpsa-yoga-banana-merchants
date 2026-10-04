package com.bananaledger.repository;

import com.bananaledger.entity.BusinessSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessSettingRepository extends JpaRepository<BusinessSetting, String> {
}

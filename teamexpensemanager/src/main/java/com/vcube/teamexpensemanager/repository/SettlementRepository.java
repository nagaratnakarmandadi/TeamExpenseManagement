package com.vcube.teamexpensemanager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vcube.teamexpensemanager.entity.Settlement;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    List<Settlement> findByEventId(Long eventId);

    List<Settlement> findByPayerId(Long payerId);

    List<Settlement> findByPayeeId(Long payeeId);
}

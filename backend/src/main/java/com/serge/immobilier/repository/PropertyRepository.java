package com.serge.immobilier.repository;

import com.serge.immobilier.model.PropertyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface PropertyRepository extends JpaRepository<PropertyEntity, Long>, JpaSpecificationExecutor<PropertyEntity> {
    Optional<PropertyEntity> findBySlug(String slug);

    Optional<PropertyEntity> findFirstByOrderByPositionDesc();
}

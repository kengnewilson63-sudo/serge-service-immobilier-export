package com.serge.immobilier.repository;

import com.serge.immobilier.model.Role;
import com.serge.immobilier.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);

    long countByRole(Role role);
}

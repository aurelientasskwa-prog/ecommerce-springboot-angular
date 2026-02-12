package com.example.demo;

import com.example.demo.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
public class IntegrationSmokeTest {

    @Autowired
    private RoleRepository roleRepository;

    @Test
    void contextLoadsAndRoleRepositoryIsPresent() {
        assertThat(roleRepository).isNotNull();
    }
}

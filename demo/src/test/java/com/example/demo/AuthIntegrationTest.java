package com.example.demo;

import com.example.demo.dto.SignupRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
public class AuthIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper mapper;

    @Test
    void signupAndSigninReturnsJwt() throws Exception {
        SignupRequest req = new SignupRequest();
        req.setUsername("testuser");
        req.setEmail("testuser@example.com");
        req.setPassword("password");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(mapper.writeValueAsString(req), headers);

        ResponseEntity<String> signupResp = restTemplate.postForEntity("/api/auth/signup", entity, String.class);
        assertThat(signupResp.getStatusCode().is2xxSuccessful()).isTrue();

        // signin via request params (the controller expects request params)
        ResponseEntity<String> signinResp = restTemplate.postForEntity("/api/auth/signin?username=testuser&password=password", null, String.class);
        assertThat(signinResp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(signinResp.getBody()).contains("token");
    }
}

package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String token; // C'est le JSON Web Token
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
}

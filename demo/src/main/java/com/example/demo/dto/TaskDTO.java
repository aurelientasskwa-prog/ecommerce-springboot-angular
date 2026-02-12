package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskDTO {
    private Long id;
    
    @NotBlank(message = "Le titre est obligatoire")
    private String title;
    
    private String description;
    
    private boolean completed;
}

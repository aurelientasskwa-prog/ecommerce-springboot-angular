package com.example.demo.controller;

import com.example.demo.dto.OrderRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<?> createOrder(Principal principal, @RequestBody OrderRequest req) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Unauthenticated");
        }
        String username = principal.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        if (req == null || req.getItems() == null || req.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Order must contain at least one item");
        }

    // Avoid complex generic inference between ResponseEntity<Order> and ResponseEntity<String>
    return orderService.create(user.getId(), req)
        .map(o -> ResponseEntity.status(201).body((Object) o))
        .orElseGet(() -> ResponseEntity.status(400).body((Object) "Could not create order"));
    }
}

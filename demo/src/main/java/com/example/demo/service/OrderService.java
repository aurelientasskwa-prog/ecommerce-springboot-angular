package com.example.demo.service;

import com.example.demo.dto.OrderItemRequest;
import com.example.demo.dto.OrderRequest;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.Product;
import com.example.demo.model.User;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<Order> create(Long userId, OrderRequest req) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return Optional.empty();

        Order order = new Order();
        order.setUser(user);
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest it : req.getItems()) {
            Product p = productRepository.findById(it.getProductId()).orElse(null);
            if (p == null) continue;
            OrderItem oi = new OrderItem();
            oi.setProduct(p);
            oi.setQuantity(it.getQuantity());
            oi.setPrice(p.getPrice());
            oi.setOrder(order);
            order.getItems().add(oi);
            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(it.getQuantity())));
            p.setStock(p.getStock() - it.getQuantity());
            productRepository.save(p);
        }

        order.setTotal(total);
        order.setStatus("CREATED");
        return Optional.of(orderRepository.save(order));
    }
}

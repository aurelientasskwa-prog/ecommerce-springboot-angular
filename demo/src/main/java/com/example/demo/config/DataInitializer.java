package com.example.demo.config;

import com.example.demo.model.Category;
import com.example.demo.model.ERole;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.model.Product;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        // Ensure roles exist
        for (ERole er : ERole.values()) {
            if (roleRepository.findByName(er).isEmpty()) {
                Role r = new Role();
                r.setName(er);
                roleRepository.save(r);
            }
        }

        // Create admin user if not present
        if (userRepository.findByUsername("admin").isEmpty()) {
            User u = new User();
            u.setUsername("admin");
            u.setEmail("admin@example.com");
            u.setPassword(passwordEncoder.encode("admin"));
            var adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElse(null);
            var roles = new HashSet<Role>();
            if (adminRole != null) roles.add(adminRole);
            u.setRoles(roles);
            userRepository.save(u);
        }

        // Seed sample category and products
        if (categoryRepository.count() == 0) {
            Category cat = new Category();
            cat.setName("Default");
            cat.setSlug("default");
            categoryRepository.save(cat);

            Product p1 = new Product();
            p1.setName("Sample Product 1");
            p1.setSku("SP1");
            p1.setDescription("Description 1");
            p1.setPrice(new BigDecimal("9.99"));
            p1.setStock(100);
            p1.setCategory(cat);
            productRepository.save(p1);

            Product p2 = new Product();
            p2.setName("Sample Product 2");
            p2.setSku("SP2");
            p2.setDescription("Description 2");
            p2.setPrice(new BigDecimal("19.99"));
            p2.setStock(50);
            p2.setCategory(cat);
            productRepository.save(p2);
        }
    }
}

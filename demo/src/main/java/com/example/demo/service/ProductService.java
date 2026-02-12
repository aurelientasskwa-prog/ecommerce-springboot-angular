package com.example.demo.service;

import com.example.demo.dto.ProductDto;
import com.example.demo.model.Category;
import com.example.demo.model.Product;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Page<ProductDto> list(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, size))
                .map(ProductDto::from);
    }

    public Optional<ProductDto> findById(Long id) {
        return productRepository.findById(id).map(ProductDto::from);
    }

    public ProductDto create(ProductDto dto) {
        Category cat = null;
        if (dto.getCategoryId() != null) {
            cat = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        }
        Product p = dto.toEntity(cat);
        Product saved = productRepository.save(p);
        return ProductDto.from(saved);
    }

    public Optional<ProductDto> update(Long id, ProductDto dto) {
        return productRepository.findById(id).map(existing -> {
            Category cat = null;
            if (dto.getCategoryId() != null)
                cat = categoryRepository.findById(dto.getCategoryId()).orElse(null);
            existing.setName(dto.getName());
            existing.setSku(dto.getSku());
            existing.setDescription(dto.getDescription());
            existing.setPrice(dto.getPrice());
            existing.setStock(dto.getStock());
            existing.setImageUrl(dto.getImageUrl());
            existing.setCategory(cat);
            return ProductDto.from(productRepository.save(existing));
        });
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}

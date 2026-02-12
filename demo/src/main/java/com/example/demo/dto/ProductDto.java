package com.example.demo.dto;

import com.example.demo.model.Category;
import com.example.demo.model.Product;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductDto {
    private Long id;
    private String name;
    private String sku;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private Long categoryId;

    public static ProductDto from(Product p) {
        ProductDto d = new ProductDto();
        d.setId(p.getId());
        d.setName(p.getName());
        d.setSku(p.getSku());
        d.setDescription(p.getDescription());
        d.setPrice(p.getPrice());
        d.setStock(p.getStock());
        d.setImageUrl(p.getImageUrl());
        if (p.getCategory() != null) d.setCategoryId(p.getCategory().getId());
        return d;
    }

    public Product toEntity(Category category) {
        Product p = new Product();
        p.setId(this.id);
        p.setName(this.name);
        p.setSku(this.sku);
        p.setDescription(this.description);
        p.setPrice(this.price);
        p.setStock(this.stock != null ? this.stock : 0);
        p.setImageUrl(this.imageUrl);
        p.setCategory(category);
        return p;
    }
}

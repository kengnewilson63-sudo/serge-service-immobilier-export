package com.serge.immobilier.dto;

import com.serge.immobilier.model.PropertyEntity;

import java.math.BigDecimal;
import java.util.List;

public record PropertyDto(
        Long id,
        String slug,
        String title,
        String type,
        String transaction,
        String status,
        boolean featured,
        String region,
        String city,
        String neighborhood,
        BigDecimal price,
        String terms,
        int rooms,
        int bathrooms,
        int area,
        String contact,
        String description,
        List<String> features,
        List<String> images,
        int position
) {
    public static PropertyDto fromEntity(PropertyEntity entity) {
        return new PropertyDto(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getType(),
                entity.getTransaction(),
                entity.getStatus(),
                entity.isFeatured(),
                entity.getRegion(),
                entity.getCity(),
                entity.getNeighborhood(),
                entity.getPrice(),
                entity.getTerms(),
                entity.getRooms(),
                entity.getBathrooms(),
                entity.getArea(),
                entity.getContact(),
                entity.getDescription(),
                entity.getFeatures(),
                entity.getImages(),
                entity.getPosition()
        );
    }
}

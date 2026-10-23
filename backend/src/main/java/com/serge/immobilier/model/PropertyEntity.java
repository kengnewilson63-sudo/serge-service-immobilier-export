package com.serge.immobilier.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties", indexes = {
    @Index(name = "idx_properties_slug", columnList = "slug", unique = true),
    @Index(name = "idx_properties_status_position", columnList = "status, position"),
    @Index(name = "idx_properties_transaction", columnList = "transaction")
})
@Getter
@Setter
@NoArgsConstructor
public class PropertyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Exposé en JSON sous "id" (et non "entityId") : le frontend s'en sert pour
    // modifier/supprimer l'annonce, et la valeur manquante cassait l'édition.
    @JsonProperty("id")
    private Long id;

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String transaction;

    @Column(nullable = false)
    private String status = "disponible";

    private boolean featured = false;

    @Column(nullable = false)
    private String region = "Littoral";

    @Column(nullable = false)
    private String city = "Douala";

    private String neighborhood = "";

    @Column(nullable = false)
    private BigDecimal price = BigDecimal.ZERO;

    private String terms = "";

    private int rooms;
    private int bathrooms;
    private int area;

    private String contact = "";

    @Column(columnDefinition = "TEXT")
    private String description = "";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "property_features", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "feature")
    private List<String> features = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "property_images", joinColumns = @JoinColumn(name = "property_id"))
    @OrderColumn(name = "image_order")
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Column(nullable = false)
    private int position = 0;
}

package com.serge.immobilier.controller;

import com.serge.immobilier.dto.PropertyDto;
import com.serge.immobilier.model.PropertyEntity;
import com.serge.immobilier.repository.PropertyRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyRepository propertyRepository;

    @GetMapping("/properties")
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String transaction,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String neighborhood,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer rooms,
            @RequestParam(required = false) Integer minArea,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "24") int limit,
            @RequestParam(required = false) String sort
    ) {
        Sort order = "recent".equals(sort)
                ? Sort.by(Sort.Direction.DESC, "id")
                : Sort.by(Sort.Direction.ASC, "position").and(Sort.by(Sort.Direction.ASC, "id"));
        Pageable pageable = PageRequest.of(offset / limit, limit, order);
        Specification<PropertyEntity> spec = buildSpecification(keyword, transaction, type, region, city, neighborhood, status, maxPrice, rooms, minArea);
        Page<PropertyEntity> resultPage = propertyRepository.findAll(spec, pageable);

        List<PropertyDto> items = resultPage.getContent().stream().map(PropertyDto::fromEntity).toList();
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("items", items);
        payload.put("total", resultPage.getTotalElements());
        payload.put("has_more", resultPage.hasNext());
        payload.put("next_cursor", resultPage.hasNext() ? (long) (offset + items.size()) : null);
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/properties/{slug}")
    public ResponseEntity<PropertyDto> getBySlug(@PathVariable String slug) {
        return propertyRepository.findBySlug(slug)
                .map(entity -> ResponseEntity.ok(PropertyDto.fromEntity(entity)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/properties")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public ResponseEntity<PropertyDto> create(@Valid @RequestBody PropertyDto payload) {
        PropertyEntity entity = new PropertyEntity();
        applyPayload(entity, payload);
        if (entity.getSlug() == null || entity.getSlug().isBlank()) {
            entity.setSlug(generateSlug(payload.title()));
        }
        // Les nouvelles annonces passent en tête de liste par défaut, sinon elles
        // seraient publiées avec position 0 et reléguées derrière tout le catalogue.
        if (payload.position() <= 0) {
            entity.setPosition(nextPosition());
        }
        PropertyEntity saved = propertyRepository.save(entity);
        return ResponseEntity.ok(PropertyDto.fromEntity(saved));
    }

    @PutMapping("/properties/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public ResponseEntity<PropertyDto> update(@PathVariable Long id, @Valid @RequestBody PropertyDto payload) {
        PropertyEntity entity = propertyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable : " + id));
        applyPayload(entity, payload);
        PropertyEntity saved = propertyRepository.save(entity);
        return ResponseEntity.ok(PropertyDto.fromEntity(saved));
    }

    @DeleteMapping("/properties/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable : " + id);
        }
        propertyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Position d'une nouvelle annonce : juste après la dernière existante, pour que
     * l'annonce apparaisse en fin de liste (la liste est triée par position croissante).
     * Le frontend envoie 0 par défaut : on ne garde donc que les positions > 0.
     */
    private int nextPosition() {
        return propertyRepository.findFirstByOrderByPositionDesc()
                .map(last -> Math.max(last.getPosition(), 0) + 1)
                .orElse(0);
    }

    private String generateSlug(String title) {
        String base = title == null ? "bien" : java.text.Normalizer.normalize(title, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (base.isBlank()) base = "bien";
        base = base.substring(0, Math.min(base.length(), 60));
        String candidate = base;
        for (int n = 2; propertyRepository.findBySlug(candidate).isPresent(); n++) {
            candidate = base + "-" + n;
        }
        return candidate;
    }

    private void applyPayload(PropertyEntity entity, PropertyDto payload) {
        entity.setSlug(payload.slug() == null || payload.slug().isBlank() ? entity.getSlug() : payload.slug());
        entity.setTitle(payload.title());
        entity.setType(payload.type());
        entity.setTransaction(payload.transaction());
        entity.setStatus(payload.status() == null ? "disponible" : payload.status());
        entity.setFeatured(payload.featured());
        entity.setRegion(payload.region());
        entity.setCity(payload.city());
        entity.setNeighborhood(payload.neighborhood());
        entity.setPrice(payload.price() == null ? BigDecimal.ZERO : payload.price());
        entity.setTerms(payload.terms());
        entity.setRooms(payload.rooms());
        entity.setBathrooms(payload.bathrooms());
        entity.setArea(payload.area());
        entity.setContact(payload.contact());
        entity.setDescription(payload.description());
        entity.setFeatures(payload.features() == null ? new ArrayList<>() : payload.features());
        entity.setImages(payload.images() == null ? new ArrayList<>() : payload.images());
        entity.setPosition(payload.position());
    }

    private Specification<PropertyEntity> buildSpecification(
            String keyword,
            String transaction,
            String type,
            String region,
            String city,
            String neighborhood,
            String status,
            BigDecimal maxPrice,
            Integer rooms,
            Integer minArea
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("type")), pattern),
                        cb.like(cb.lower(root.get("neighborhood")), pattern),
                        cb.like(cb.lower(root.get("city")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }
            if (transaction != null && !transaction.isBlank()) predicates.add(cb.equal(root.get("transaction"), transaction));
            if (type != null && !type.isBlank()) predicates.add(cb.equal(root.get("type"), type));
            if (region != null && !region.isBlank()) predicates.add(cb.equal(root.get("region"), region));
            if (city != null && !city.isBlank()) predicates.add(cb.equal(root.get("city"), city));
            if (neighborhood != null && !neighborhood.isBlank()) predicates.add(cb.equal(root.get("neighborhood"), neighborhood));
            if (status != null && !status.isBlank()) predicates.add(cb.equal(root.get("status"), status));
            if (maxPrice != null) predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            if (rooms != null) predicates.add(cb.greaterThanOrEqualTo(root.get("rooms"), rooms));
            if (minArea != null) predicates.add(cb.greaterThanOrEqualTo(root.get("area"), minArea));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}

package com.serge.immobilier.bootstrap;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Donne une position aux photos déjà en base après l'ajout de la colonne
 * `property_images.image_order` (migration V2).
 *
 * Sur une base existante, les photos n'avaient aucune position : Hibernate ne peut
 * pas valider une colonne NOT NULL dans ce cas. Ce composant ajoute donc la
 * colonne si besoin, supprime les doublons (une même photo deux fois sur un bien
 * empêcherait deux positions distinctes) puis numérote les photos restantes
 * 0, 1, 2… dans l'ordre où la base les renvoyait. Il ne fait rien une fois que
 * tout est à jour.
 */
@Component
@RequiredArgsConstructor
public class ImageOrderMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        Integer missing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns "
                        + "WHERE table_name = 'property_images' AND column_name = 'image_order'",
                Integer.class);
        boolean columnCreated = missing != null && missing == 0;
        if (columnCreated) {
            jdbcTemplate.execute("ALTER TABLE property_images ADD COLUMN image_order INTEGER");
        }

        Integer unpositioned = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM property_images WHERE image_order IS NULL", Integer.class);
        if (unpositioned == null || unpositioned == 0) {
            if (columnCreated) {
                jdbcTemplate.execute("ALTER TABLE property_images ALTER COLUMN image_order SET NOT NULL");
            }
            return;
        }

        // 1. Doublons : une photo identique deux fois sur le même bien n'apporte rien
        //    et empêcherait deux photos d'occuper la même position.
        jdbcTemplate.update(
                "DELETE FROM property_images pi USING property_images other "
                        + "WHERE pi.property_id = other.property_id "
                        + "AND pi.image_url IS NOT DISTINCT FROM other.image_url "
                        + "AND pi.ctid > other.ctid");

        // 2. Numérotation dans l'ordre où la base renvoyait les photos.
        jdbcTemplate.update(
                "UPDATE property_images pi SET image_order = ordered.rn "
                        + "FROM (SELECT ctid, ROW_NUMBER() OVER (PARTITION BY property_id ORDER BY ctid) - 1 AS rn "
                        + "      FROM property_images WHERE image_order IS NULL) ordered "
                        + "WHERE pi.ctid = ordered.ctid");

        jdbcTemplate.execute("ALTER TABLE property_images ALTER COLUMN image_order SET NOT NULL");
    }
}

-- Ordre des photos d'une annonce (galerie jusqu'à 10 photos).
--
-- Hibernate écrivait les photos dans `property_images` sans position : la base
-- renvoyait un ordre arbitraire, et la couverture du catalogue pouvait changer
-- d'une lecture à l'autre. La colonne `image_order` fixe cet ordre ; elle est
-- remplie au démarrage par `ImageOrderMigration` (photos existantes numérotées
-- 0, 1, 2…, doublons supprimés), puis Hibernate la maintient à jour.
--
-- La colonne reste nullable ici : sur une base existante, les photos n'ont pas
-- encore de position et une colonne NOT NULL ferait échouer la migration.
-- `ImageOrderMigration` numérote les photos existantes puis passe la colonne en
-- NOT NULL ; une base neuve reçoit la contrainte dès le premier démarrage.
ALTER TABLE IF EXISTS property_images
    ADD COLUMN IF NOT EXISTS image_order INTEGER;

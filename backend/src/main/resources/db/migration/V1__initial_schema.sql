-- Schéma initial de Serge Service Immobilier.
--
-- Les « IF NOT EXISTS » permettent de rejouer ce script sur une base déjà créée
-- par Hibernate (au premier passage, Flyway la baseline en version 0).

CREATE TABLE IF NOT EXISTS app_users (
    id        BIGSERIAL PRIMARY KEY,
    email     VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password  VARCHAR(255) NOT NULL,
    role      VARCHAR(255) NOT NULL
);
DO $$ BEGIN
    ALTER TABLE app_users ADD CONSTRAINT app_users_role_check CHECK (role IN ('ADMIN', 'USER'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_email ON app_users (email);

CREATE TABLE IF NOT EXISTS properties (
    id           BIGSERIAL PRIMARY KEY,
    area         INTEGER        NOT NULL,
    bathrooms    INTEGER        NOT NULL,
    city         VARCHAR(255)   NOT NULL,
    contact      VARCHAR(255),
    description  TEXT,
    featured     BOOLEAN        NOT NULL,
    neighborhood VARCHAR(255),
    position     INTEGER        NOT NULL,
    price        NUMERIC(38, 2) NOT NULL,
    region       VARCHAR(255)   NOT NULL,
    rooms        INTEGER        NOT NULL,
    slug         VARCHAR(255)   NOT NULL,
    status       VARCHAR(255)   NOT NULL,
    terms        VARCHAR(255),
    title        VARCHAR(255)   NOT NULL,
    transaction  VARCHAR(255)   NOT NULL,
    type         VARCHAR(255)   NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_slug ON properties (slug);
CREATE INDEX IF NOT EXISTS idx_properties_status_position ON properties (status, position);
CREATE INDEX IF NOT EXISTS idx_properties_transaction ON properties (transaction);

CREATE TABLE IF NOT EXISTS property_features (
    property_id BIGINT NOT NULL REFERENCES properties (id),
    feature     VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS property_images (
    property_id BIGINT NOT NULL REFERENCES properties (id),
    image_url   VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    token_hash VARCHAR(255)               NOT NULL,
    user_id    BIGINT                     NOT NULL REFERENCES app_users (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_token_hash ON password_reset_tokens (token_hash);

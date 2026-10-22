package com.serge.immobilier.model;

/**
 * ADMIN : peut publier, modifier et supprimer les annonces (espace /admin).
 * USER  : ne peut pas modifier le catalogue (compte simple / futur client).
 */
public enum Role {
    ADMIN,
    USER
}

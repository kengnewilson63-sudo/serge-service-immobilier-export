import React from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/AuthLayout";
import { CONTACT, PRIMARY } from "@/data/site";

/**
 * La création de compte publique est désactivée côté serveur (ALLOW_REGISTRATION=false) :
 * c'est l'agence qui crée les accès depuis /admin → Comptes & accès.
 * On affiche donc une page d'information plutôt qu'un formulaire qui renverrait 403.
 */
export default function Register() {
  return (
    <AuthLayout
      icon={ShieldCheck}
      title="Accès sur invitation"
      subtitle="La création de compte est réservée à l'agence"
    >
      <p className="text-center text-sm text-muted-foreground">
        Les comptes sont créés par l'administrateur de Serge Service Immobilier, puis
        communiqués par e-mail ou téléphone. Si vous avez déjà un accès, connectez-vous.
      </p>
      <Button asChild className="mt-6 w-full h-12 font-medium">
        <a href="/login">Se connecter</a>
      </Button>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Besoin d'un accès ? Appelez le {PRIMARY.label} ou écrivez à {CONTACT.email}.
      </p>
    </AuthLayout>
  );
}

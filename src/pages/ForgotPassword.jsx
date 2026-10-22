import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await base44.auth.resetPasswordRequest(email);
      setDevResetUrl(result?.devResetUrl || "");
    } catch {
      // On affiche toujours le même message, que le compte existe ou non.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Réinitialiser le mot de passe"
      subtitle="Nous vous enverrons un lien pour le modifier"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Retour à la connexion
        </Link>
      }
    >
      {sent ? (
        <div className="text-center">
          <p className="text-sm text-foreground">
            Si un compte existe avec cet e-mail, un lien de réinitialisation a été généré.
          </p>
          {devResetUrl && (
            <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-left">
              <p className="text-xs font-medium text-muted-foreground">
                Mode développement (aucun e-mail envoyé) :
              </p>
              <Link to={devResetUrl} className="mt-1 block text-sm text-primary hover:underline">
                Ouvrir le lien de réinitialisation
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi…
              </>
            ) : (
              "Envoyer le lien"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
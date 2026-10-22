import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Deux modes : mot de passe, ou « code d'accès » fourni par l'agence (mode sans
  // mot de passe personnel). Le code est vérifié par le serveur (SETUP_CODE).
  const [useCode, setUseCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Après connexion : ?next= (envoyé par la page /admin) ou ?returnTo=.
  // Uniquement des chemins du site — safeReturnTo refuse tout le reste.
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || params.get("returnTo");
  const returnTo = next ? safeReturnTo(next) : safeReturnTo();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (useCode) {
        await base44.auth.loginWithCode(email.trim(), password);
      } else {
        await base44.auth.loginViaEmailPassword(email.trim(), password);
      }
      window.location.href = returnTo;
    } catch (err) {
      // Le serveur répond 400 (et non 401/403) pour un mauvais mot de passe :
      // certains proxys transforment les 401 en « Request failed (403) ».
      const status = err?.status;
      if (status === 400 || status === 401) {
        setError(err.message || "E-mail ou mot de passe incorrect.");
      } else if (status === 403) {
        // L'API a répondu (elle est jointe) : c'est le serveur qui refuse, pas le CORS.
        // L'ancien message renvoyait vers ALLOWED_ORIGINS, ce qui égarait : le vrai
        // problème était un jeton expiré ou des droits insuffisants.
        setError(
          err.message ||
            `Le serveur a refusé la connexion (403) pour ${window.location.origin}. ` +
              "Vérifiez vos droits d'accès ou reconnectez-vous."
        );
      } else if (!err?.status) {
        // Aucune réponse HTTP : le serveur n'est pas joignable (pas démarré, mauvaise adresse).
        setError(
          "Impossible de joindre le serveur. Vérifiez qu'il est démarré et que le site utilise la même adresse que l'API."
        );
      } else {
        setError(err.message || `Connexion impossible (erreur ${status}).`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", returnTo);
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Bon retour"
      subtitle="Connectez-vous à votre compte"
      footer={
        <>
          Vous n'avez pas de compte ?{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="text-primary font-medium hover:underline"
          >
            Créer un compte
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continuer avec Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">ou</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{useCode ? "Code d'accès" : "Mot de passe"}</Label>
            <button
              type="button"
              onClick={() => setUseCode((value) => !value)}
              className="text-xs text-primary hover:underline"
            >
              {useCode ? "J'ai un mot de passe" : "J'ai un code d'accès"}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {!useCode && (
          <p className="text-xs text-muted-foreground">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Mot de passe oublié ?
            </Link>{' '}
            Si le mot de passe ne fonctionne pas, l'agence peut aussi vous transmettre un code
            d'accès : cliquez sur « J'ai un code d'accès » ci-dessus.
          </p>
        )}
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connexion…
            </>
          ) : useCode ? (
            "Vérifier le code"
          ) : (
            "Se connecter"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
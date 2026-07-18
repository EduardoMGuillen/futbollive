"use client";

import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
    });
    setLoading(false);
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error || "No se pudo iniciar sesión.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={submit}>
      <div className="form-field"><label htmlFor="username">Usuario</label><input id="username" name="username" autoComplete="username" defaultValue="admin" required /></div>
      <div className="form-field"><label htmlFor="password">Contraseña</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-btn full-btn" disabled={loading} type="submit"><LockKeyhole size={17} /> {loading ? "Ingresando..." : "Entrar al panel"}</button>
    </form>
  );
}

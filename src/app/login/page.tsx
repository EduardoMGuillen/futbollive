import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { LoginForm } from "@/components/LoginForm";
import { isAuthenticated } from "@/lib/auth";

export const metadata = { title: "Acceso administrativo" };

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/dashboard");
  return (
    <div className="login-page">
      <div className="auth-card">
        <Brand />
        <h1>Panel administrativo</h1>
        <p>Gestiona eventos, destacados, anuncios y sincronización.</p>
        <LoginForm />
      </div>
    </div>
  );
}

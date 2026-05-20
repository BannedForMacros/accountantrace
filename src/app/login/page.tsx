import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <AuthShell
      titulo="Inicia sesion"
      subtitulo="Continua tu carrera contable"
      footer={
        <span>
          No tienes cuenta?{" "}
          <Link
            href="/registro"
            className="font-semibold text-[var(--ar-green-500)] underline-offset-4 hover:underline"
          >
            Registrate
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}

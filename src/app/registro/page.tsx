import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegistroForm } from "./RegistroForm";

export default async function RegistroPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <AuthShell
      titulo="Crea tu cuenta"
      subtitulo="Comienza tu carrera contable desde la Etapa 0"
      footer={
        <span>
          Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--ar-green-500)] underline-offset-4 hover:underline"
          >
            Inicia sesion
          </Link>
        </span>
      }
    >
      <RegistroForm />
    </AuthShell>
  );
}

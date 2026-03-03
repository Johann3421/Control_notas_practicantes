"use server"

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Ingresa tu email y contraseña." }
  }

  try {
    await signIn("credentials", { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Credenciales inválidas. Verifica tu email y contraseña." }
    }
    // Re-throw non-auth errors (e.g. network / DB errors)
    throw error
  }

  // signIn succeeded — determine redirect target from session
  const session = await auth()
  if (session?.user?.role === "INTERN") {
    redirect("/intern")
  }
  redirect("/mentor")
}

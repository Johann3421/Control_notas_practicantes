import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import InternSidebar from "@/components/intern/InternSidebar"

export default async function InternLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || session.user.role !== "INTERN") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-base-950">
      <InternSidebar
        internName={session.user.name ?? "Practicante"}
        internEmail={session.user.email ?? ""}
      />
      <main className="flex-1 pb-20 md:pb-0 md:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

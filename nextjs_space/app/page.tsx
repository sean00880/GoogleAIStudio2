import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { Landing } from "@/components/landing"

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect("/app")
  }
  
  return <Landing />
}
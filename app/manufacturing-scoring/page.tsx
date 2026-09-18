import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ManufacturingScoringContent from "./ManufacturingScoringContent";

export default async function ManufacturingScoringPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/manufacturing-scoring");
  }

  return (
    <ManufacturingScoringContent
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    />
  );
}
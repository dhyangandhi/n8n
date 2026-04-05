import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";

const Page = async () => {
  const users = await prisma.user.findMany();

  return (
    <div className="min-h-screen flex items-center min-w-screen justify-center">
      {JSON.stringify(users)}
    </div>
  )
}

export default Page;
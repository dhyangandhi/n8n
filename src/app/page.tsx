import { requireAuth } from "@/lib/auth-utils";
import { getServerCaller } from "@/trpc/server";
import { LogoutButton } from "./logout";


const Page = async () => {
  await requireAuth();

  const trpcServer = await getServerCaller();
  const data = await trpcServer.getUsers();

  return (
    <div className="min-H-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      <div>protected page server</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <LogoutButton />
    </div>
  );
};

export default Page;
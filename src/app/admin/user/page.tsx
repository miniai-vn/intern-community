import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {  redirect } from "next/navigation";
import { UserTable } from "@/components/Usertable";


export default async function AdminUserPage() {
  const session = await auth();
  

  if (!session?.user?.isAdmin) redirect("/");


  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
      <UserTable initialUsers={users} />
    </div>
  );
}
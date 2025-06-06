// app/api/reset-password/route.ts

import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { deleteToken, updateUserPassword } from "../../../../db/queries"; // write this function

export async function POST(req: Request) {
  const { userId, token, password } = await req.json();

  if (!userId || !token || !password) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const hashed = await hashPassword(password);
    await updateUserPassword(userId, hashed); // You write this in your DB queries
    await deleteToken(token);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

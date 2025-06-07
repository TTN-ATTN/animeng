import { NextResponse } from "next/server";
import { getUserFromDB, updateToken } from "../../../../db/queries";
import { sendEmail } from "@/lib/sendemail";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await getUserFromDB(email);
  console.log("User found:", user);
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("base64url");
  const expireTime = new Date(Date.now() + 15 * 60 * 60 * 1000);
  const resetLink = `${process.env.PUBLIC_URL}/reset-password?token=${token}&userId=${user.id}`;
  const html = `<h1>Hi, this is your reset password link</h1>
    <p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;

  try {
    const result = await sendEmail(user.email, "Reset your password on Anime Learning", html);
    console.log("Email sent result:", result);
    await updateToken(user.id, token, expireTime);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Email sending failed" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { insertUser } from '../../../../../db/queries';
import { hashPassword } from '@/lib/password';
import db from '../../../../../db/drizzle';

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // Check user exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const pwdhash = await hashPassword(password);

  try {
    await insertUser(email, pwdhash, name, "/user_icon.png");
    return NextResponse.json({ success: 'Register Successfully' }, { status: 201 });
  } catch (error) {
    console.error('DB insert error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}

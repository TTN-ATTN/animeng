import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { getUserFromDB, insertUser, inserUserOauth } from "../db/queries"
import bcrypt from "bcryptjs"
import { hashMd5, hashPassword } from "./lib/password"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {}
        },
      authorize: async (credentials) => {
        console.log("Credentials received:", credentials);
        let user = null
        const { email, password } = credentials as { email: string; password: string };
        user = await getUserFromDB(email);
        if (!user || !bcrypt.compareSync(password, user.pwdhash)) {
          throw new Error("Invalid credentials.")
        }
        return user
      },
    })
  ],
  session: {
    strategy: "jwt", 
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const existingUser = await getUserFromDB(user.email!);
      user.id = hashMd5(user.email!, user.name!);
      if (!existingUser) {
        const password = Math.random().toString(36).slice(-8);
        const pwdhash = await hashPassword(password);
        // console.log("Creating new user:", user.id);
        // console.log("Created user ID:", user.id);
        await inserUserOauth(user.id, user.email!, pwdhash, user.name!, user.image!);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // console.log("User ID:", user.id);
        token.id = user.id;
        token.picture = user.image;
      }
      return token;
    },
  
    async session({ session, token }) {
      if (token && session.user) {
        // console.log("Token ID:", token.id);
        session.user.id = token.id as string;
        session.user.image = token.picture as string;
      }
      // console.log("Session callback:", session);
      return session;
    },
  },
  secret: process.env.AUTH_SECRET, // Ensure AUTH_SECRET is set in .env
})


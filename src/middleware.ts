// Backend middleware: xử lý route authentication
import { clerkMiddleware, createRouteMatcher} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Thêm route phải đăng nhập mới được phép truy cập
const isProtectedRoute = createRouteMatcher(['/learning(.*)','/shop(.*)','/quests(.*)','leaderboard(.*)'])
const isWebhookRoute = createRouteMatcher(['/api/webhooks/stripe', '/']);
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect() 
  if (isWebhookRoute(req)) return NextResponse.next()
})


export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
        '/',
    ],
};

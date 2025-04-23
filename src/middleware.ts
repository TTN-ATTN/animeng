// Backend middleware: xử lý route authentication
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Thêm route phải đăng nhập mới được phép truy cập
const isProtectedRoute = createRouteMatcher(['/learning(.*)','/shop(.*)','/quests(.*)','leaderboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
        '/',
    ],
};

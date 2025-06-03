// import { auth } from "@clerk/nextjs/server" // Removed Clerk auth
import { auth } from "@/auth"; // Import NextAuth config

// IMPORTANT: Update these user IDs to match the NextAuth user IDs for your admin users.
// Clerk user IDs are different from NextAuth user IDs.
const adminUserIds = [
    "clerk_user_id_1", // Replace with actual NextAuth user ID for admin 1
    "clerk_user_id_2", // Replace with actual NextAuth user ID for admin 2
    // Add other admin NextAuth user IDs here
];

export const getIsAdmin = async () => {
    const session = await auth(); // Get NextAuth session
    const userId = session?.user?.id; // Get user ID from NextAuth session

    if (!userId) {
        return false;
    }

    // Check if the NextAuth user ID is in the admin list
    return adminUserIds.includes(userId);
};


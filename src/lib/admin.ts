import { auth } from "@clerk/nextjs/server"

const whitelist = [
    "user_...pCqHKs3E", // Your user ID here.
]

export const getIsAdmin = async () => {
    const {userId} = await auth();
    if (!userId) {
        return false;
    }

    return whitelist.indexOf(userId) !== -1;
}
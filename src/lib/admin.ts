import { auth } from "@clerk/nextjs/server"

const whitelist = [
    "user_...pCqHKs3E", // Your user ID here.
    "user_2w7xQcYyBfgl0NRVg4w0ZrcWLjB"
]

export const getIsAdmin = async () => {
    const {userId} = await auth();
    if (!userId) {
        return false;
    }

    return whitelist.indexOf(userId) !== -1;
}

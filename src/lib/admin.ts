import { auth } from "@clerk/nextjs/server"

const whitelist = [
    "user_2wqnwL2LkH7qGB6OkwUpCqHKs3E",
]

export const getIsAdmin = async () => {
    const {userId} = await auth();
    if (!userId) {
        return false;
    }

    return whitelist.indexOf(userId) !== -1;
}
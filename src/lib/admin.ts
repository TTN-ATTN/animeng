import { auth } from "@clerk/nextjs/server"

const whitelist = [
    "user_2uipkU6mEODowY2JJPwKnZ80r7j",
]   

export const getIsAdmin = async () => {
    const {userId} = await auth();
    if (!userId) {
        return false;
    }

    return whitelist.indexOf(userId) !== -1;
}
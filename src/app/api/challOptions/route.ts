import { NextResponse } from "next/server";
import db from "../../../../db/drizzle";
import { getIsAdmin } from "@/lib/admin";
import { challOptions } from "../../../../db/schema";

export const GET = async (req: Request) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.query.challOptions.findMany();
    return NextResponse.json(data);
};

export const POST = async (req: Request) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = await req.json();

    const data = await db.insert(challOptions).values({
        ...body,
    }).returning();
    console.log("Inserted new data sucessfully", data);
    return NextResponse.json(data[0]);
};


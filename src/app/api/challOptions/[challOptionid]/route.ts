import { NextResponse } from "next/server";
import { challOptions } from "../../../../../db/schema";
import db from "../../../../../db/drizzle";
import { eq } from "drizzle-orm";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (
    req: Request,
    { params }: { params: { challOptionid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.query.challOptions.findMany({
        where: eq(challOptions.id, params.challOptionid),
    });
    
    return NextResponse.json(data[0]);
};

export const PUT = async (
    req: Request,
    { params }: { params: { challOptionid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const data = await db.update(challOptions).set({
        ...body,
    }).where(eq(challOptions.id, params.challOptionid)).returning();
    return NextResponse.json(data[0]);
};

export const DELETE = async (
    req: Request,
    { params }: { params: { challOptionid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.delete(challOptions)
        .where(eq(challOptions.id, params.challOptionid)).returning();
    return NextResponse.json(data[0]);
};
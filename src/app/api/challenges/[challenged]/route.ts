import { NextResponse } from "next/server";
import { challenges } from "../../../../../db/schema";
import db from "../../../../../db/drizzle";
import { eq } from "drizzle-orm";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (
    req: Request,
    { params }: { params: { challengeid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.query.challenges.findMany({
        where: eq(challenges.id, params.challengeid),
    });
    return NextResponse.json(data[0]);
};

export const PUT = async (
    req: Request,
    { params }: { params: { challengeid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const data = await db.update(challenges).set({
        ...body,
    }).where(eq(challenges.id, params.challengeid)).returning();
    return NextResponse.json(data[0]);
};

export const DELETE = async (
    req: Request,
    { params }: { params: { challengeid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.delete(challenges)
        .where(eq(challenges.id, params.challengeid)).returning();
    return NextResponse.json(data[0]);
};
import { NextResponse } from "next/server";
import { units } from "../../../../../db/schema";
import db from "../../../../../db/drizzle";
import { eq } from "drizzle-orm";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (
    req: Request,
    { params }: { params: { unitid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.query.units.findMany({
        where: eq(units.id, params.unitid),
    });
    return NextResponse.json(data[0]);
};

export const PUT = async (
    req: Request,
    { params }: { params: { unitid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const data = await db.update(units).set({
        ...body,
    }).where(eq(units.id, params.unitid)).returning();
    return NextResponse.json(data[0]);
};

export const DELETE = async (
    req: Request,
    { params }: { params: { unitid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.delete(units)
        .where(eq(units.id, params.unitid)).returning();
    return NextResponse.json(data[0]);
};
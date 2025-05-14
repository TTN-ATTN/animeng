import { NextResponse } from "next/server";
import { lessons } from "../../../../../db/schema";
import db from "../../../../../db/drizzle";
import { eq } from "drizzle-orm";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (
    req: Request,
    { params }: { params: { lessonid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.query.lessons.findMany({
        where: eq(lessons.id, params.lessonid),
    });
 
    return NextResponse.json(data[0]);
};

export const PUT = async (
    req: Request,
    { params }: { params: { lessonid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const data = await db.update(lessons).set({
        ...body,
    }).where(eq(lessons.id, params.lessonid)).returning();
    return NextResponse.json(data[0]);
};

export const DELETE = async (
    req: Request,
    { params }: { params: { lessonid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.delete(lessons)
        .where(eq(lessons.id, params.lessonid)).returning();
    return NextResponse.json(data[0]);
};
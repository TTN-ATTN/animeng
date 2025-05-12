import { NextResponse } from "next/server";
import { courses } from "../../../../../db/schema";
import db from "../../../../../db/drizzle";
import { eq } from "drizzle-orm";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (
    req: Request,
    { params }: { params: { courseid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.query.courses.findMany({
        where: eq(courses.id, params.courseid),
    });
    return NextResponse.json(data[0]);
};

export const PUT = async (
    req: Request,
    { params }: { params: { courseid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const data = await db.update(courses).set({
        ...body,
    }).where(eq(courses.id, params.courseid)).returning();
    return NextResponse.json(data[0]);
};

export const DELETE = async (
    req: Request,
    { params }: { params: { courseid: number } },
) => {
    const isAdmin = await getIsAdmin();
    if(!isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.delete(courses)
        .where(eq(courses.id, params.courseid)).returning();
    return NextResponse.json(data[0]);
};
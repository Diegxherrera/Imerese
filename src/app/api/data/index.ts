import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET: Fetch all orgs.
export async function GET() {
    const spaces = await prisma.organization.findMany();
    return NextResponse.json(spaces, { status: 200 });
}
a
// POST: Add a new organization
export async function POST(req: NextRequest) {
    const body = await req.json();
    const space = await prisma.organization.create({
        data: {
            name: body.name,
            description: body.image,
        },
    });

    return NextResponse.json(space, { status: 201 });
}
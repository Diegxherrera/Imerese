import { prisma } from "@/lib/prisma"; // Prisma client setup in lib/prisma.ts
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all orgs.
export async function GET() {
    const spaces = await prisma.organization.findMany();
    return NextResponse.json(spaces, { status: 200 });
}

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
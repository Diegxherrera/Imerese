import { NextRequest, NextResponse } from "next/server";

//req is short for request
export async function GET(req: NextRequest) {
    return NextResponse.json(
        { message: "this is a get request" },
        { status: 200 }
    );
}

export async function POST(req: NextRequest) {
    return NextResponse.json(
        { message: "This is a post request" },
        { status: 200 }
    );
}

export async function PATCH(req: NextRequest) {
    return NextResponse.json(
        { message: "This is a patch request" },
        { status: 200 }
    );
}
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { organizationId: string; categoryId: string } }
) {
    const { organizationId, categoryId } = params;

    console.log("Fetching data for:", { organizationId, categoryId });

    try {
        // Validate organizationId and categoryId
        if (!organizationId || !categoryId) {
            console.error("Invalid parameters:", { organizationId, categoryId });
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        // Fetch data from Prisma
        const products = await prisma.product.findMany({
            where: {
                category: {
                    id: categoryId, // Ensure categoryId exists
                    organization: {
                        id: organizationId, // Ensure organizationId exists
                    },
                },
            },
        });

        // Handle no results
        if (!products || products.length === 0) {
            console.log("No products found for:", { organizationId, categoryId });
            return NextResponse.json([], { status: 200 }); // Return an empty array
        }

        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

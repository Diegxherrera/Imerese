import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    req: Request,
    { params }: { params: { organizationId: string } }
) {
    const { organizationId } = params;

    try {
        // Validate the organizationId
        if (!organizationId) {
            return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
        }

        // Fetch all products for the organization
        const products = await prisma.product.findMany({
            where: {
                category: {
                    organization: {
                        name: organizationId, // Filter by organization name
                    },
                },
            },
            select: {
                id: true,
                name: true,
                cost: true,
                amount: true,
                status: true,
                creationDate: true,
                category: {
                    select: {
                        name: true, // Include category name
                    },
                },
            },
        });

        // Summarize the data by category
        const categorySummary: Record<string, { quantity: number; subtotal: number }> = {};

        products.forEach((product) => {
            const categoryName = product.category.name;

            if (!categorySummary[categoryName]) {
                categorySummary[categoryName] = { quantity: 0, subtotal: 0 };
            }

            categorySummary[categoryName].quantity += product.amount;
            categorySummary[categoryName].subtotal += product.amount * product.cost;
        });

        // Convert the summary into an array
        const summary = Object.entries(categorySummary).map(([category, data]) => ({
            category,
            quantity: data.quantity,
            subtotal: data.subtotal,
        }));

        // Return the summarized data
        return NextResponse.json(summary, { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
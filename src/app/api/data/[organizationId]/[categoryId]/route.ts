import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { Product } from "@/data/product_example"; // Adjust this import based on your structure

const prisma = new PrismaClient();

export async function GET(
    req: Request,
    { params }: { params: { organizationId: string; categoryId: string } }
) {
    const { organizationId, categoryId } = await params;

    try {
        // Validate organizationId and categoryId
        if (!organizationId || !categoryId) {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        // Fetch products from the database
        const products = await prisma.product.findMany({
            where: {
                category: {
                    name: categoryId,
                    organization: {
                        name: organizationId,
                    },
                },
            },
            select: {
                id: true, // Make sure to include the ID in the selection
                name: true,
                cost: true,
                amount: true,
                status: true,
                categoryId: true,
            },
        });

        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { organizationId: string; categoryId: string } }
) {
    const { organizationId, categoryId } = await params;

    console.log("Params received:", { organizationId, categoryId });

    if (!organizationId || !categoryId) {
        return NextResponse.json({ error: "Missing organizationId or categoryId" }, { status: 400 });
    }

    try {
        const body = await req.json();
        console.log("Received payload:", body);

        const { name, cost, amount, status } = body;

        // Validate the payload
        if (!name || !cost || !amount || !status) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Find the category by name and organization
        const category = await prisma.category.findFirst({
            where: {
                name: categoryId,
                organization: {
                    name: organizationId,
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: `Category '${categoryId}' not found for organization '${organizationId}'` },
                { status: 404 }
            );
        }

        // Create a new product
        const product = await prisma.product.create({
            data: {
                name,
                cost,
                amount,
                status,
                categoryId: category.id, // Use the actual `id` from the database
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { organizationId: string; categoryId: string } }
) {
    const { organizationId, categoryId } = await params;

    console.log("Deleting product for:", { organizationId, categoryId });

    try {
        const body = await req.json();
        const { productId } = body;

        // Validate productId
        if (!productId) {
            return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
        }

        // Delete product in Prisma
        const deletedProduct = await prisma.product.delete({
            where: { id: productId },
        });

        return NextResponse.json(deletedProduct, { status: 200 });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { organizationId: string; categoryId: string } }
) {
    const { organizationId, categoryId } = await params;

    console.log("Updating product for:", { organizationId, categoryId });

    try {
        const body = await req.json();
        console.log("Parsed Request Body:", body);

        const { productId, name, cost, amount, status } = body;

        // Validate required fields
        if (!productId || productId === '0') {
            return NextResponse.json({ error: "Invalid or missing productId" }, { status: 400 });
        }

        // Build update data object dynamically
        const updateData: Partial<Product> = {};
        if (name !== undefined) updateData.name = name;
        if (cost !== undefined) updateData.cost = parseFloat(cost);
        if (amount !== undefined) updateData.amount = parseInt(amount);
        if (status !== undefined) updateData.status = status;

        console.log("Update data:", updateData);

        // Update product in Prisma
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: updateData,
        });

        return NextResponse.json(updatedProduct, { status: 200 });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
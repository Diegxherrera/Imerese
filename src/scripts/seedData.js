import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Create the organizations
    const organizations = [
        { name: "nebrija", description: "Instituto Nebrija" },
        { name: "puenteuropa", description: "IFPS Puenteuropa" },
        { name: "alcazaren", description: "Alcazarén Formación" },
        { name: "cnse", description: "Fundación CNSE" },
    ];

    for (const org of organizations) {
        // Upsert organization without specifying `id`
        const organization = await prisma.organization.upsert({
            where: { name: org.name },
            update: {},
            create: {
                name: org.name,
                description: org.description,
            },
        });

        console.log(`Organization created/updated: ${organization.name}`);

        // Create categories for each organization
        const categories = ["devices", "digital_assets", "materials"];
        for (const categoryName of categories) {
            await prisma.category.upsert({
                where: { name_organizationId: { name: categoryName, organizationId: organization.id } },
                update: {},
                create: {
                    name: categoryName,
                    organizationId: organization.id,
                },
            });
            console.log(`Category created: ${categoryName} for ${organization.name}`);
        }
    }

    console.log("Seeding complete!");
}

// Run the seed script
main()
    .catch((e) => {
        console.error("Error seeding data:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
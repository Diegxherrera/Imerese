import { columns } from "./columns"
import { Product } from "@/data/product_example"
import { DataTable } from "./data-table"
import products from "@/data/product_example"; // Import the data from the product_example file

async function getData(): Promise<Product[]> {
    // Simulate fetching data with a delay if needed
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(products);
        }, 500); // Optional delay for simulation (e.g., 500ms)
    });
}

export default async function DemoPage() {
    const data = await getData()

    return (
        <div className="container">
            <p className="text-5xl pb-5"> Equipos </p>
            <DataTable columns={columns} data={data} />
        </div>
    )
}

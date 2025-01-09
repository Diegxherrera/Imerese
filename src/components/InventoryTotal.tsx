import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useEffect, useState} from "react";

// Define a mapping object for category names
const categoryNameMapping: Record<string, string> = {
    digital_assets: "Activos Digitales",
    materials: "Materiales",
    devices: "Dispositivos",
};

interface CategorySummary {
    category: string;
    quantity: number;
    subtotal: number;
}

export default function InventoryTotal({ organizationName }: { organizationName: string }) {
    const [categoriesSummary, setCategoriesSummary] = useState<CategorySummary[]>([]);
    const [totals, setTotals] = useState({ totalQuantity: 0, totalValue: 0 });

    // Fetch products and calculate summary
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch data for the organization
                const response = await fetch(`/api/data/${organizationName}`);
                if (!response.ok) {
                    console.error("Failed to fetch data");
                    return;
                }

                const categoriesSummary = await response.json();

                // Update state with the summarized data
                setCategoriesSummary(categoriesSummary);

                // Calculate totals
                const totalQuantity = categoriesSummary.reduce((acc, item) => acc + item.quantity, 0);
                const totalValue = categoriesSummary.reduce((acc, item) => acc + item.subtotal, 0);
                setTotals({ totalQuantity, totalValue });
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, [organizationName]);

    return (
        <Card className="w-[400px] h-[420px]">
            <CardHeader>
                <CardTitle className="text-center">Inventario total</CardTitle>
                <CardDescription className="text-center">
                    Aquí se encuentra la cantidad y valor estimado de los activos del espacio.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Categoría</TableHead>
                            <TableHead className="text-right">Artículos</TableHead>
                            <TableHead className="text-right">Valor est.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categoriesSummary.length > 0
                            ?
                            categoriesSummary.map((category) => (
                                <TableRow key={category.category}>
                                    <TableCell className="font-medium">
                                        {categoryNameMapping[category.category] || category.category}
                                    </TableCell>
                                    <TableCell className="text-right">{category.quantity}</TableCell>
                                    <TableCell className="text-right">
                                        {category.subtotal.toLocaleString("es-ES")}€
                                    </TableCell>
                                </TableRow>
                            ))
                            :
                            <TableRow>
                                <TableCell className="col-span-full font-medium text-center">
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableHead className="w-[100px]">Total</TableHead>
                            <TableHead className="text-right">{totals.totalQuantity}</TableHead>
                            <TableHead className="text-right">{totals.totalValue.toLocaleString("es-ES")}€</TableHead>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    )
}
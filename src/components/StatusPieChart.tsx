"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface StatusSummary {
    status: string;
    quantity: number;
}

const statusNameMapping: Record<string, string> = {
    "En almacen": "En almacén",
    "Pendiente de compra": "Pendiente de compra",
    "En transito": "En tránsito",
    "Desconocido": "Desconocido",
};

export function StatusPieChart({ organizationName }: { organizationName: string }) {
    const [chartData, setChartData] = React.useState<StatusSummary[]>([]);
    const [totalItems, setTotalItems] = React.useState<number>(0);

    React.useEffect(() => {
        async function fetchData() {
            try {
                console.log(`Fetching data for organization: ${organizationName}`);
                const response = await fetch(`/api/data/${organizationName}`);
                if (!response.ok) {
                    console.error("Failed to fetch data");
                    return;
                }

                const products = await response.json();
                console.log("Fetched products:", products);

                const statusSummary: Record<string, number> = {};
                products.forEach((product: any) => {
                    const { status, amount } = product;
                    if (!statusSummary[status]) {
                        statusSummary[status] = 0;
                    }
                    statusSummary[status] += amount;
                });

                console.log("Status summary:", statusSummary);

                const summaryArray = Object.entries(statusSummary).map(([status, quantity], index) => ({
                    status: statusNameMapping[status] || status,
                    quantity,
                    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
                }));

                console.log("Processed chart data:", summaryArray);

                setChartData(summaryArray);
                const total = summaryArray.reduce((acc, curr) => acc + curr.quantity, 0);
                setTotalItems(total);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, [organizationName]);

    const chartConfig = React.useMemo(
        () =>
            chartData.reduce<ChartConfig>(
                (config, item, index) => ({
                    ...config,
                    [item.status]: {
                        label: item.status,
                        color: `hsl(var(--chart-${index + 1}))`,
                    },
                }),
                { items: { label: "Items" } }
            ),
        [chartData]
    );

    if (!chartData || chartData.length === 0) {
        console.log("No chart data available to display.");
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Inventario por Estado</CardTitle>
                    <CardDescription>No hay datos disponibles para mostrar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center">No hay datos para mostrar.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Inventario por Estado</CardTitle>
                <CardDescription>Cantidad total de artículos por estado</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer className="mx-auto aspect-square max-h-[250px]" config={chartConfig}>
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="quantity"
                            nameKey="status"
                            innerRadius={60}
                            outerRadius={100}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalItems.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Artículos
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Incremento estimado del 5.2% este mes <TrendingUp className="h-4 w-4" />
                </div>
            </CardFooter>
        </Card>
    );
}
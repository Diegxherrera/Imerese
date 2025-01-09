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
import {Button} from "@/components/ui/button";

interface CategorySummary {
    category: string;
    quantity: number;
}

const categoryNameMapping: Record<string, string> = {
    digital_assets: "Activos Digitales",
    materials: "Materiales",
    devices: "Dispositivos",
};

export function CategoriesPieChart({ organizationName }: { organizationName: string }) {
    const [chartData, setChartData] = React.useState<CategorySummary[]>([]);
    const [totalItems, setTotalItems] = React.useState<number>(0);

    React.useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/data/${organizationName}`);
                if (!response.ok) {
                    console.error("Failed to fetch data");
                    return;
                }

                const data: CategorySummary[] = await response.json();

                // Map categories to Spanish labels and prepare chart data
                const mappedData = data.map((item, index) => ({
                    ...item,
                    category: categoryNameMapping[item.category] || item.category,
                    fill: `hsl(var(--chart-${(index % 5) + 1}))`, // Dynamically assign fill color
                }));

                setChartData(mappedData);

                // Calculate total items
                const total = mappedData.reduce((acc, curr) => acc + curr.quantity, 0);
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
                    [item.category]: {
                        label: item.category,
                        color: `hsl(var(--chart-${index + 1}))`, // Dynamic color for each category
                    },
                }),
                { visitors: { label: "Items" } }
            ),
        [chartData]
    );

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Inventario por Categoría</CardTitle>
                <CardDescription>Cantidad total de artículos</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 items-center pb-0">
                {/* Chart Container */}
                <ChartContainer className="mx-auto aspect-square max-h-[250px]" config={chartConfig}>
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="quantity"
                            nameKey="category"
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
                <div className="leading-none text-muted-foreground text-center">
                    Mostrando datos por categoría de la organización
                </div>
            </CardFooter>
        </Card>
    );
}
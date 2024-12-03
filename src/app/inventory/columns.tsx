"use client"
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/data/product_example"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, MoreHorizontal, Truck} from "lucide-react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"


const StatusCell: React.FC<{ initialStatus: string; onChange: (newStatus: string) => void }> = ({
    initialStatus,
    onChange,
    }) => {
    const [currentStatus, setCurrentStatus] = React.useState(initialStatus);

    const Icon = statusIcons[currentStatus as keyof typeof statusIcons];

    const handleStatusChange = (newStatus: string) => {
        setCurrentStatus(newStatus);
        onChange(newStatus);
    };

    return (
        <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-5 w-5 text-gray-600" />} {/* Render current icon */}
            <Select
                onValueChange={(value) => handleStatusChange(value)}
                defaultValue={initialStatus}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Estado</SelectLabel>
                        <SelectItem value="Pendiente de compra">Pendiente de compra</SelectItem>
                        <SelectItem value="En transito">En tránsito</SelectItem>
                        <SelectItem value="En almacen">En almacén</SelectItem>
                        <SelectItem value="Desconocido">Desconocido</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export const statusIcons = {
    "Pendiente de compra": Clock, // Example icon for "Pendiente de compra"
    "En transito": Truck, // Example icon for "En tránsito"
    "En almacen": CheckCircle, // Example icon for "Entregado"
    "Desconocido": AlertCircle, // Example icon for "Desconocido"
};

export const columns: ColumnDef<Product>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nombre
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const name: string = row.getValue("name");
            return (
                <a href='/product/${name}'>{name}</a>
            )
        }
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Estado
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const initialStatus: string = row.getValue("status");

            return (
                <StatusCell
                    initialStatus={initialStatus}
                    onChange={(newStatus) => {
                        console.log(`Row ID: ${row.original.id}, New Status: ${newStatus}`);
                        // Handle the change (e.g., update the backend or state)
                    }}
                />
            );
        },
    },
    {
        accessorKey: "amount",
        header: "Cantidad",
    },
    {
        accessorKey: "cost",
        header: () => <div className="text-right">Precio</div>,
        cell: ({ row }) => {
            const cost = parseFloat(row.getValue("cost"))
            const formatted = new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
            }).format(cost)

            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(product.name)}
                        >
                            Copiar nombre
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ver producto</DropdownMenuItem>
                        <DropdownMenuItem>Ver más detalles</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

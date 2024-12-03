"use client"

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
import {MoreHorizontal, Truck} from "lucide-react";
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

export const statusIcons = {
    "Pendiente de compra": Clock, // Example icon for "Pendiente de compra"
    "En transito": Truck, // Example icon for "En tránsito"
    "Entregado": CheckCircle, // Example icon for "Entregado"
    "Desconocido": AlertCircle, // Example icon for "Desconocido"
};

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: "Nombre",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status: string = row.getValue("status");
            const Icon = statusIcons[status as keyof typeof statusIcons];

            // Handle status change (e.g., update backend or local state)
            const handleStatusChange = (newStatus: string) => {
                // You can update the row or call an API here
                console.log(`Status changed to: ${newStatus}`);
            };

            return (
                <div className="flex items-center space-x-2">
                    {Icon && <Icon className="h-5 w-5 text-gray-600" />} {/* Render current icon */}
                    <Select
                        onValueChange={(value) => handleStatusChange(value)}
                        defaultValue={status}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Status</SelectLabel>
                                <SelectItem value="Pendiente de compra">Pendiente de compra</SelectItem>
                                <SelectItem value="En tránsito">En tránsito</SelectItem>
                                <SelectItem value="Entregado">Entregado</SelectItem>
                                <SelectItem value="Desconocido">Desconocido</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: "Cantidad",
    },
    {
        accessorKey: "price",
        header: () => <div className="text-right">Precio</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const payment = row.original

            return (
                <DropdownMenu>
                    {/* eslint-disable-next-line react/jsx-no-undef */}
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(payment.id)}
                        >
                            Copy payment ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

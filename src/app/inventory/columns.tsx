"use client"
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/data/product_example"
import {Button} from "@/components/ui/button";
import {ArrowUpDown, Truck, Warehouse} from "lucide-react";
import { Clock, AlertCircle } from "lucide-react";
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


export const StatusCell: React.FC<{
    rowId: string; // Required for existing rows
    initialStatus: string;
    organizationId: string | null;
    categoryId: string | null;
    isNewRow?: boolean; // Optional, defaults to false for existing rows
    onChange: (rowId: string | null, newStatus: string) => void; // rowId is required for existing rows
}> = ({ rowId, initialStatus, organizationId, categoryId, isNewRow = false, onChange }) => {
    const [currentStatus, setCurrentStatus] = React.useState(initialStatus);
    const [isUpdating, setIsUpdating] = React.useState(false); // Tracks backend update status

    const Icon = statusIcons[currentStatus as keyof typeof statusIcons];

    const handleStatusChange = async (newStatus: string) => {
        setCurrentStatus(newStatus);
        onChange(rowId, newStatus);

        // Skip backend update if it's a new row
        if (isNewRow) return;

        try {
            setIsUpdating(true); // Start loading indicator
            const response = await fetch(
                `/api/data/${organizationId}/${categoryId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ productId: rowId, status: newStatus }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update status.");
            }

            const updatedData = await response.json();
            console.log("Status updated successfully:", updatedData);
        } catch (error) {
            console.error("Error updating status:", error);
            // Optionally show a toast or revert the status change
            setCurrentStatus(initialStatus); // Revert to the previous status on error
        } finally {
            setIsUpdating(false); // Stop loading indicator
        }
    };

    return (
        <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-5 w-5 text-gray-600 ml-4 mr-2" />}
            <Select
                onValueChange={handleStatusChange}
                value={currentStatus}
                disabled={isUpdating} // Disable while updating to prevent duplicate requests
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
    "En almacen": Warehouse, // Example icon for "Entregado"
    "Desconocido": AlertCircle, // Example icon for "Desconocido"
};

export const columns: ColumnDef<Product>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center mt-[2px]">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
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
            );
        },
        cell: ({ row }) => {
            const initialStatus: string = row.getValue("status");
            const rowId: string = row.original.id; // Unique row ID
            const { organizationId, categoryId } = row.original; // Pass organizationId and categoryId

            return (
                <StatusCell
                    rowId={rowId}
                    initialStatus={initialStatus}
                    organizationId={organizationId}
                    categoryId={categoryId}
                    onChange={(rowId, newStatus) => {
                        console.log(`Row ID: ${rowId}, New Status: ${newStatus}`);
                    }}
                />
            );
        },
    },
    {
        accessorKey: "creationDate",
        header: () => <div className="text-center">Fecha de creación</div>,
        cell: ({ getValue }) => {
            // Explicitly cast the value returned by getValue to string | number | Date
            const rawValue = getValue() as string | number | Date;
            const creationDate = rawValue ? new Date(rawValue) : null; // Ensure the value is valid

            let formattedDate = "N/A"; // Default fallback

            if (creationDate) {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);

                if (creationDate >= today) {
                    formattedDate = `Hoy a las ${creationDate.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}`;
                } else if (creationDate >= yesterday && creationDate < today) {
                    formattedDate = `Ayer a las ${creationDate.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}`;
                } else {
                    formattedDate = `${creationDate.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })} | ${creationDate.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}`;
                }
            }

            return <div className="text-center">{formattedDate}</div>;
        },
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-center">Cantidad</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));

            return (
                <div className="text-center">{amount}</div>
            )
        }
    },
    {
        accessorKey: "cost",
        header: () => <div className="text-center">Precio</div>,
        cell: ({ row }) => {
            const cost = parseFloat(row.getValue("cost"))
            const formatted = new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
            }).format(cost)

            return <div className="text-center font-medium">{formatted}</div>
        },
    },
]

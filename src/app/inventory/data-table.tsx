"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    VisibilityState,
    useReactTable,
    ColumnFiltersState,
} from "@tanstack/react-table"
import jsPDF from "jspdf";
import "jspdf-autotable"; // Ensure you have installed jspdf-autotable
import * as XLSX from "xlsx";
import { unparse } from "papaparse";

import { useToast } from "@/hooks/use-toast"; // Import the toast hook
import { ToastAction } from "@/components/ui/toast";
import { v4 as uuidv4 } from 'uuid';

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import React from "react";
import {Product} from "@/data/product_example";
import {
    ChevronDown,
    CircleCheckBig,
    FileSpreadsheet,
    FileText,
    Pencil,
    Plus,
    Sheet,
    Trash2
} from "lucide-react";
import {StatusCell} from "@/app/inventory/columns";
import {Checkbox} from "@/components/ui/checkbox";
import {timestamp} from "yaml/dist/schema/yaml-1.1/timestamp";

interface DataTableProps<TData extends Product, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    categoryName: string | undefined;
    organizationName: string | null;
    setDataAction: React.Dispatch<React.SetStateAction<TData[]>> | null;
}

export function DataTable<TData extends Product, TValue>({                                                                     columns,
        data,
        categoryName,
        organizationName,
        setDataAction,
    }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [newRowsData, setNewRowsData] = React.useState<Partial<Product>[]>([]);
    const [editableRows, setEditableRows] = React.useState<Record<string, boolean>>({});
    const [editedRows, setEditedRows] = React.useState<{
        [id: string]: Partial<Product>;
    }>({});

    const { toast } = useToast();

    const categoryTitles: Record<string, string> = {
        devices: "Dispositivos",
        digital_assets: "Activos Digitales",
        materials: "Materiales",
    };

    // Define the types for the arguments
    interface ColumnDef {
        accessorKey: string; // Key used to access values in the data rows
        header: string | (() => string); // Can be a string or a function returning a string
    }

    interface RowData {
        [key: string]: any; // Allow dynamic keys with any value
    }

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    async function saveChanges() {
        // Validate new rows
        const hasInvalidRows = newRowsData.some(
            (row) =>
                !row.name ||
                !row.status ||
                row.amount === undefined ||
                row.cost === undefined ||
                isNaN(row.cost)
        );

        if (hasInvalidRows) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor complete todos los campos requeridos en las filas nuevas.",
                action: <ToastAction altText="Cerrar">Cerrar</ToastAction>,
            });
            return;
        }

        try {
            const responses = await Promise.all(
                newRowsData.map((row) =>
                    fetch(`/api/data/${organizationName}/${categoryName}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: row.name,
                            status: row.status,
                            amount: row.amount,
                            cost: row.cost,
                            creationDate: row.creationDate, // Include the creationDate
                        }),
                    })
                )
            );

            // Check for failures in the responses
            responses.forEach((response, index) => {
                if (!response.ok) {
                    console.error(`Failed to save row ${index}:`, response.statusText);
                }
            });

            // Handle API Responses
            const savedProducts = await Promise.all(responses.map((res) => res.json()));

            // Update Table
            if (setDataAction) {
                setDataAction((prev) => (prev ? [...prev, ...savedProducts] : savedProducts));
            }

            setNewRowsData([]); // Clear new rows
            toast({
                variant: "default",
                title: "¡Éxito!",
                description: "Los cambios se han guardado correctamente.",
                action: <ToastAction altText="Cerrar">Cerrar</ToastAction>,
            });
        } catch (error) {
            console.error("Error saving changes:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Ocurrió un error al guardar los cambios.",
                action: <ToastAction altText="Reintentar">Reintentar</ToastAction>,
            });
        }
    }

    function exportTableToPDF(
        organizationName: string, // Name of the organization
        categoryName: string, // Name of the category
        tableData: RowData[], // Array of data rows
        columns: ColumnDef[] // Array of column definitions
    ): void {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4",
        });

        // Translation mapping for headers
        const headerTranslations: Record<string, string> = {
            status: "Estado",
            name: "Nombre",
            creationDate: "Fecha de creación",
            amount: "Cantidad",
            cost: "Precio",
        };

        // Organization name mapping
        const organizationNameMapping: Record<string, string> = {
            nebrija: "Instituto Nebrija",
            alcazaren: "Alcazarén Formación",
            puenteuropa: "IFPS Puenteuropa",
            cnse: "Fundación CNSE",
        };

        // Translate the organization name if it matches one in the mapping
        const translatedOrganizationName =
            organizationNameMapping[organizationName] || organizationName;

        // Table headers (process `columns` to extract headers as plain strings and translate)
        const headers: string[] = columns
            .filter((col) => col.accessorKey !== "id") // Exclude 'id'
            .filter((col) => col.accessorKey !== "select") // Exclude 'select'
            .map((col) =>
                headerTranslations[col.accessorKey] || col.accessorKey // Translate or use accessorKey
            );

        // Prepare table data (exclude private fields like 'id' and 'select')
        const data: string[][] = tableData.map((row) =>
            columns
                .filter((col) => col.accessorKey !== "id")
                .filter((col) => col.accessorKey !== "select")
                .map((col) => String(row[col.accessorKey] || "")) // Convert all values to strings for the PDF
        );

        // Add title to PDF
        doc.setFontSize(15);
        const topMargin = 40; // Adjust the margin value as needed
        doc.text(`${translatedOrganizationName} / ${categoryName}`, 20, topMargin);

        // Add footer
        doc.setFontSize(5); // Set smaller font size
        doc.text("Generated by Imerese Technologies", 20, 47);

        // Add table to PDF
        doc.autoTable({
            head: [headers],
            body: data,
            startY: 60,
            styles: {
                fontSize: 8, // Compact font size for table
                cellPadding: 2,
            },
            margin: { top: 20, bottom: 20, left: 30, right: 30 },
        });

        // Save the PDF with a generated filename
        const timestamp = Date.now();
        doc.save(`${translatedOrganizationName}_${categoryName}_${timestamp}.pdf`);
    }

    function exportTableToExcel(organizationName: string, categoryName: string, tableData: RowData[], columns: ColumnDef[]): void {
        // Translation mapping for headers
        const headerTranslations = {
            status: "Estado",
            name: "Nombre",
            creationDate: "Fecha de creación",
            amount: "Cantidad",
            cost: "Precio",
        };

        // Map columns to headers
        const headers = columns
            .filter((col) => col.accessorKey !== "id" && col.accessorKey !== "select") // Exclude 'id' and 'select'
            .map((col) => headerTranslations[col.accessorKey] || col.accessorKey);

        // Prepare data for Excel
        const data = tableData.map((row) => {
            const rowData = {};
            columns
                .filter((col) => col.accessorKey !== "id" && col.accessorKey !== "select") // Exclude 'id' and 'select'
                .forEach((col) => {
                    const translatedKey = headerTranslations[col.accessorKey] || col.accessorKey;
                    rowData[translatedKey] = row[col.accessorKey];
                });
            return rowData;
        });

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `${categoryName}`);

        // Generate Excel file
        const filename = `${organizationName}_${categoryName}.xlsx`;
        XLSX.writeFile(workbook, filename);
    }

    function exportTableToCSV(organizationName: string, categoryName: string, tableData: RowData[], columns: ColumnDef[]) {
        // Translation mapping for headers
        const headerTranslations = {
            status: "Estado",
            name: "Nombre",
            creationDate: "Fecha de creación",
            amount: "Cantidad",
            cost: "Precio",
        };

        // Map columns to headers
        const headers = columns
            .filter((col) => col.accessorKey !== "id" && col.accessorKey !== "select") // Exclude 'id' and 'select'
            .map((col) => headerTranslations[col.accessorKey] || col.accessorKey);

        // Prepare data for CSV
        const data = tableData.map((row) => {
            const rowData = {};
            columns
                .filter((col) => col.accessorKey !== "id" && col.accessorKey !== "select") // Exclude 'id' and 'select'
                .forEach((col) => {
                    const translatedKey = headerTranslations[col.accessorKey] || col.accessorKey;
                    rowData[translatedKey] = row[col.accessorKey];
                });
            return rowData;
        });

        // Combine headers and data
        const csv = unparse({
            fields: headers, // Add headers as the first row
            data: data, // Add the rows
        });

        // Create a Blob and download it
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const filename = `${organizationName}_${categoryName}.csv`;
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleDelete = async () => {
        if (!data || !setDataAction) {
            console.error("Data or setDataAction is not available");
            return;
        }

        const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

        if (selectedRows.length === 0) {
            return; // Do nothing if no rows are selected
        }

        if (window.confirm("¿Estás seguro de que deseas eliminar las filas seleccionadas?")) {
            try {
                // Send DELETE request for each selected product
                const responses = await Promise.all(
                    selectedRows.map((row) =>
                        fetch(`/api/data/${organizationName}/${categoryName}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ productId: row.id }), // Ensure `row.id` exists
                        })
                    )
                );

                // Check if any response failed
                const failedResponses = responses.filter((res) => !res.ok);
                if (failedResponses.length > 0) {
                    throw new Error(
                        `${failedResponses.length} de ${responses.length} filas no se pudieron eliminar.`
                    );
                }

                // Filter out deleted rows from the local state
                const remainingRows = data.filter(
                    (row) => !selectedRows.some((selected) => selected.id === row.id)
                );

                setDataAction(remainingRows);

                toast({
                    variant: "default",
                    title: "¡Éxito!",
                    description: `${selectedRows.length} fila(s) eliminadas correctamente.`,
                });
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Ocurrió un error al eliminar las filas seleccionadas.",
                    action: <ToastAction altText="Reintentar">Reintentar</ToastAction>,
                });
                console.error("Error deleting rows:", error);
            }
        }
    };

    const handleNewRowChange = (index: number, field: keyof Product, value: string | number) => {
        setNewRowsData((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            )
        );
    };

    async function handleEditRow(rowId: string) {
        const updatedData = editedRows[rowId];
        if (!updatedData) {
            // Close the edit menu
            setEditableRows((prev) => ({
                ...prev,
                [rowId]: false,
            }));

            return; // Exit early since there's no data to update
        }

        console.log("Payload being sent:", { productId: rowId, ...updatedData });

        try {
            const response = await fetch(`/api/data/${organizationName}/${categoryName}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: rowId, // Backend UUID
                    ...updatedData,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update the row.");
            }

            const updatedRow = await response.json();

            if (setDataAction) {
                setDataAction((prev) =>
                    prev.map((row) => (row.id === rowId ? { ...row, ...updatedRow } : row))
                );
            }

            toast({
                variant: "default",
                title: "¡Éxito!",
                description: "Los cambios se han guardado correctamente.",
            });

            setEditableRows((prev) => ({
                ...prev,
                [rowId]: false,
            }));

            setEditedRows((prev) => {
                const updated = { ...prev };
                delete updated[rowId];
                return updated;
            });

        } catch (error) {
            console.error("Error during row update:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo actualizar la fila. Por favor, inténtelo de nuevo.",
            });
        }
    }

    function isNewRowValid(): boolean {
        if (newRowsData.length === 0) {
            return false; // Button should remain disabled if no rows are created
        }

        const firstRow = newRowsData[0]; // Check the first row
        return (
            firstRow.name &&
            firstRow.status !== undefined && // Allow "Desconocido"
            firstRow.amount !== undefined &&
            firstRow.cost !== undefined &&
            !isNaN(firstRow.cost) &&
            !isNaN(firstRow.amount)
        );
    }

    const handleEditToggle = (rowId: string) => {
        setEditableRows((prev) => ({
            ...prev,
            [rowId]: !prev[rowId],
        }));

        // Clear edits if canceling edit mode
        if (editableRows[rowId]) {
            setEditedRows((prev) => {
                const updated = { ...prev };
                delete updated[rowId];
                return updated;
            });
        }
    };

    const handleInputChange = (
        rowId: string, // This will now be row.original.id
        column: keyof Product,
        value: string | number
    ) => {
        setEditedRows((prev) => ({
            ...prev,
            [rowId]: {
                ...prev[rowId], // Ensure other fields are retained
                [column]: value,
            },
        }));
    };

    const addNewRow = () => {
        setNewRowsData((prev) => [
            ...prev,
            {  id: uuidv4(),
                status: "Desconocido", // Default to "Desconocido"
                creationDate: new Date().toLocaleDateString("es-ES") },
        ]);
    };

    const columnHeaders: Record<string, string> = {
        name: "Nombre",
        status: "Estado",
        creationDate: "Fecha de Creación",
        amount: "Cantidad",
        cost: "Costo",
        actions: "Acciones",
    };

    console.log("New Rows Initial Value: " + newRowsData)

    return (
        <div>
            <div className="flex flex-row justify-between mb-3">
                <div className="text-2xl ml-1 flex justify-end items-end">
                    <span className="font-bold">Inventario</span>&nbsp;/&nbsp;{categoryName === undefined ? "Error" : categoryTitles[categoryName]}
                </div>
                <div className="flex flex-row space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Exportar
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="items-start">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    const tableData = table.getRowModel()?.rows?.map((row) => row.original) || [];
                                    const columns = table.getAllColumns()?.map((col) => ({
                                        accessorKey: col.id,
                                        header: col.columnDef.header,
                                    })) || [];

                                    // Validate the data before exporting
                                    if (!tableData.length || !columns.length) {
                                        console.error("Table data or columns are invalid");
                                        console.log(tableData.toString())
                                        return;
                                    }

                                    exportTableToPDF(organizationName, categoryTitles[categoryName], data, columns);
                                }}
                            >
                                <FileText />
                                PDF
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => exportTableToExcel(
                                    organizationName === "nebrija" ? "Instituto Nebrija" :
                                        organizationName === "alcazaren" ? "Alcazarén Formación" :
                                            organizationName === "puenteuropa" ? "IFPS Puenteuropa" :
                                                organizationName === "cnse" ? "Fundación CNSE" : organizationName,
                                    categoryName,
                                    data,
                                    columns
                                )}
                            >
                                <FileSpreadsheet />
                                Excel
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => exportTableToCSV(
                                    organizationName === "nebrija" ? "Instituto Nebrija" :
                                        organizationName === "alcazaren" ? "Alcazarén Formación" :
                                            organizationName === "puenteuropa" ? "IFPS Puenteuropa" :
                                                organizationName === "cnse" ? "Fundación CNSE" : organizationName,
                                    categoryName,
                                    data,
                                    columns
                                )}
                            >
                                <FileText />
                                CSV
                            </Button>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columnas
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {columnHeaders[column.id] || column.columnDef.header?.toString()}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Input
                        placeholder="Filtrar productos..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm ml-4"
                    />
                    <Button
                        className="ml-auto bg-blue-600"
                        onClick={addNewRow} // Add a new row each click
                    >
                        <Plus />
                    </Button>
                </div>
            </div>
            {/* Table rendering remains unchanged */}
            <div className="rounded-md border max-h-full sm:w-[75%] xl:w-full">
                <Table key={table.getRowModel().rows.length} id="exportableTable">
                    {/* Table Header */}
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableCell>
                                ))}
                                <TableCell className="text-center">Acciones</TableCell>
                            </TableRow>
                        ))}
                    </TableHeader>
                    {/* Table Body */}
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        const columnId = cell.column.id;
                                        const isEditable =
                                            editableRows[row.original.id] &&
                                            ["name", "amount", "cost", "status"].includes(columnId);

                                        return (
                                            <TableCell key={cell.id}>
                                                {isEditable && columnId === "status" ? (
                                                    <StatusCell
                                                        initialStatus={editedRows[row.original.id]?.status ?? cell.getValue()}
                                                        onChange={(newStatus) =>
                                                            handleInputChange(row.original.id, "status", newStatus)
                                                        }
                                                    />
                                                ) : isEditable ? (
                                                    <Input
                                                        value={
                                                            editedRows[row.original.id]?.[columnId as keyof Product] ??
                                                            cell.getValue()
                                                        }
                                                        placeholder={`Edit ${columnId}`}
                                                        onChange={(e) =>
                                                            handleInputChange(row.original.id, columnId as keyof Product, e.target.value)
                                                        }
                                                    />
                                                ) : (
                                                    flexRender(cell.column.columnDef.cell, cell.getContext())
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (editableRows[row.original.id]) {
                                                    handleEditRow(row.original.id); // Use the original ID here
                                                } else {
                                                    handleEditToggle(row.original.id); // Toggle edit mode
                                                }
                                            }}
                                        >
                                            {editableRows[row.original.id] ? (
                                                <span className="text-green-600">
                                                    <CircleCheckBig />
                                                </span> // Save icon
                                            ) : (
                                                <Pencil /> // Edit icon
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (!newRowsData.length && !table.getRowModel().rows.length) ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        ) : null
                        }

                        {/* Render new rows */}
                        {newRowsData.map((rowData, index) => (
                            <TableRow key={`new-${index}`}>
                                <TableCell>
                                    <div className="flex items-center">
                                        <Checkbox
                                            checked={false}
                                            aria-label="Select row"
                                            disabled
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="Nombre"
                                        value={rowData.name || ""}
                                        onChange={(e) => handleNewRowChange(index, "name", e.target.value)}
                                        className="w-full max-w-[150px]" // Constrain width
                                    />
                                </TableCell>
                                <TableCell className="justify-center">
                                    <StatusCell
                                        initialStatus={"Desconocido"}
                                        onChange={(newStatus) =>
                                            handleNewRowChange(index, "status", newStatus)
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="Fecha de Creación"
                                        value={
                                            rowData.creationDate ||
                                            new Date().toLocaleString("es-ES", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                        }
                                        disabled
                                        className="w-full max-w-[200px] text-center" // Consistent width
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="Cantidad"
                                        value={rowData.amount || ""}
                                        type="number"
                                        onChange={(e) =>
                                            handleNewRowChange(index, "amount", Number(e.target.value))
                                        }
                                        className="w-full max-w-[100px] text-right" // Right-align numbers
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="Costo"
                                        value={rowData.cost || ""}
                                        type="number"
                                        onChange={(e) =>
                                            handleNewRowChange(index, "cost", Number(e.target.value))
                                        }
                                        className="w-full max-w-[100px] text-right" // Right-align numbers
                                    />
                                </TableCell>
                                <TableCell className="flex text-center justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={true}
                                    >
                                        <Pencil />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Save Changes Button */}
            <div className="flex flex-row space-between py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    <Button
                        variant={
                            table.getFilteredSelectedRowModel().rows.length > 0 ? "destructive" : "outline"
                        }
                        size="sm"
                        onClick={handleDelete}
                        disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                        className="mr-3"
                    >
                        <Trash2 />
                    </Button>
                    {table.getFilteredSelectedRowModel().rows.length} de&nbsp;
                    {table.getFilteredRowModel()?.rows?.length || 0 } fila(s) seleccionadas.
                </div>
                <div className="flex items-center justify-end space-x-2 mr-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </Button>
                </div>
                <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={saveChanges}
                    disabled={!isNewRowValid()}
                >
                    Guardar cambios
                </Button>
            </div>
            {/*TODO: Alert yet to be added*/}
        </div>
    );
}

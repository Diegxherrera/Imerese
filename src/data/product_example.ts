export type Product = {
    id: string
    name: string
    cost: number
    amount: number
    status: "Pendiente de compra" | "En transito" | "En almacen" | "Desconocido"
    space: "Nebrija" | "CNSE" | "Puenteuropa" | "Alcazaren"
    creationDate?: string; // Add this field
    organizationId: string;
    categoryId: string;
}
export type Product = {
    id: string
    name: string
    cost: number
    amount: number
    status: "Pendiente de compra" | "En transito" | "Entregado" | "Desconocido"
    space: "Nebrija" | "CNSE" | "Puenteuropa" | "Alcazaren"
}

export const example_inventory: Product[] = [
    {
        id: "728ed52f",
        name: "Meta Quest 3S",
        cost: 800,
        amount: 2,
        status: "Pendiente de compra",
        space: "Nebrija",
    },
    {
        id: "2095xj2f",
        name: "Meta Quest Pro",
        cost: 1200,
        amount: 1,
        status: "En transito",
        space: "CNSE",
    },
    {
        id: "2095xj2f",
        name: "Camisetas Signalee",
        cost: 60,
        amount: 30,
        status: "Desconocido",
        space: "Nebrija",
    },
]

export default example_inventory
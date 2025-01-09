export type Order = {
    id: string
    buyerId: string
    cost: number
    paymentStatus: "pending" | "processing" | "completed"
    email: string;
    productsId: string[]
}

export const orders: Order[] = [
    {
        id: "ja2nfd823ng",
        buyerId: "i38t8ds",
        cost: 42,
        paymentStatus: "pending",
        email: "metrikaindahouse@gmail.com",
        productsId: [""],
    },
    {
        id: "ja2nfd823ng",
        buyerId: "i323597196968t8ds",
        cost: 42,
        paymentStatus: "completed",
        email: "metrikaindahouse@gmail.com",
        productsId: [""],
    },
]

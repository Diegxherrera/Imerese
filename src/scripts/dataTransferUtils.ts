import Papa from "papaparse"
import { Product } from ".prisma/client"
import { useToast } from "@/hooks/use-toast"

export async function importJSONtoTable(
    e: React.ChangeEvent<HTMLInputElement>,
    organizationName: string | null,
    categoryName: string | undefined,
    setDataAction: React.Dispatch<React.SetStateAction<Product[]>>,
    toast: ReturnType<typeof useToast>["toast"]
) {
    try {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const fileContent = event.target?.result
                if (!fileContent) {
                    throw new Error("File content is empty.")
                }
                // Parse JSON
                const parsedData = JSON.parse(fileContent.toString())

                if (!Array.isArray(parsedData)) {
                    throw new Error("El archivo JSON no es un array.")
                }

                // POST each row
                const responses = await Promise.all(
                    parsedData.map((row: any) =>
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
                                creationDate: row.creationDate,
                            }),
                        })
                    )
                )

                // Check for failures
                responses.forEach((response, index) => {
                    if (!response.ok) {
                        console.error(`Failed to save row ${index}:`, response.statusText)
                    }
                })

                // Convert to JSON
                const savedProducts = await Promise.all(responses.map((res) => res.json()))

                // Update table
                setDataAction((prev) => (prev ? [...prev, ...savedProducts] : savedProducts))

                toast({
                    variant: "default",
                    title: "¡Éxito!",
                    description: "Los datos se han importado correctamente.",
                })
            } catch (error) {
                console.error("Error importing JSON:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `Ocurrió un error al importar los datos: ${error?.message || ""}`,
                })
            }
        }

        reader.readAsText(file)
    } catch (error) {
        console.error("Error reading file:", error)
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo leer el archivo JSON.",
        })
    }
}

export async function importCSVtoTable(
    e: React.ChangeEvent<HTMLInputElement>,
    organizationName: string | null,
    categoryName: string | undefined,
    setDataAction: React.Dispatch<React.SetStateAction<Product[]>>,
    toast: ReturnType<typeof useToast>["toast"]
) {
    try {
        const file = e.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const dataRows = results.data
                if (!Array.isArray(dataRows)) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "El archivo CSV no contiene datos válidos.",
                    })
                    return
                }

                // OPTIONAL: console.log to inspect the parsed rows
                console.log("Parsed CSV Rows:", dataRows)

                try {
                    // Validate & POST each row
                    const responses = await Promise.all(
                        dataRows.map(async (row: any, idx: number) => {
                            // 1. Parse numeric fields safely
                            //    Fallback to 0 or skip row if invalid
                            const parsedAmount = Number(row.amount)
                            const parsedCost = Number(row.cost)

                            // 2. Check for NaN or missing required fields
                            const missingName = !row.name
                            const missingStatus = !row.status
                            const invalidAmount = Number.isNaN(parsedAmount)
                            const invalidCost = Number.isNaN(parsedCost)

                            if (missingName || missingStatus || invalidAmount || invalidCost) {
                                console.warn(`Row ${idx} has invalid data:`, row)
                                // Option A: Skip invalid row
                                return null

                                // Option B: Provide fallback:
                                // row.name = row.name ?? "Sin nombre"
                                // parsedAmount = isNaN(parsedAmount) ? 0 : parsedAmount
                                // parsedCost = isNaN(parsedCost) ? 0 : parsedCost
                            }

                            // 3. Construct a valid body for the API
                            const requestBody = {
                                name: row.name,
                                status: row.status,
                                amount: parsedAmount,
                                cost: parsedCost,
                                creationDate: row.creationDate || new Date().toISOString(),
                            }

                            const res = await fetch(`/api/data/${organizationName}/${categoryName}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(requestBody),
                            })

                            return res
                        })
                    )

                    // Filter out any `null` (skipped) rows
                    const validResponses = responses.filter(Boolean) as Response[]

                    // Check for failures
                    validResponses.forEach((response, idx) => {
                        if (!response.ok) {
                            console.error(`Failed to save row ${idx}:`, response.statusText)
                        }
                    })

                    // Convert each success response to JSON
                    const savedProducts = await Promise.all(
                        validResponses.map((res) => res.json())
                    )

                    if (savedProducts.length > 0) {
                        // Merge into existing table data
                        setDataAction((prev) => (prev ? [...prev, ...savedProducts] : savedProducts))
                    }

                    toast({
                        variant: "default",
                        title: "¡Éxito!",
                        description: "Los datos se han importado correctamente.",
                    })
                } catch (error) {
                    console.error("Error importing CSV:", error)
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: `Ocurrió un error al importar los datos: ${
                            error?.message || ""
                        }`,
                    })
                }
            },
            error: (err) => {
                console.error("PapaParse error:", err)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Error al parsear el CSV.",
                })
            },
        })
    } catch (error) {
        console.error("Error reading file:", error)
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo leer el archivo CSV.",
        })
    }
}
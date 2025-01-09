"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { columns } from "../../columns";
import { DataTable } from "../../data-table";
import { Product } from "@/data/product_example";
import DataTableLoading from "@/components/DataTableLoading";

async function fetchData(resource: string): Promise<Product[]> {
    const response = await fetch(`/api/data/${resource}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched data with IDs:", data); // Debugging
    return data;
}

export default function DataTablePage() {
    const { organizationName, categoryName } = useParams(); // Get route parameters

    const resource = `${organizationName}/${categoryName}`; // Construct resource path

    const [data, setData] = useState<Product[]>([]); // Default to an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const fetchedData = await fetchData(resource);

                // Map the fetched data to include both `id` and `originalId`
                const processedData = fetchedData.map((item) => ({
                    ...item,
                    originalId: item.id, // Save backend ID as originalId
                    id: item.id, // Match id to backend ID (optional: generate unique IDs if necessary)
                }));

                setData(processedData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [resource]);

    if (loading) {
        return <DataTableLoading />;
    }

    if (error) {
        return <p>Error loading data: {error}</p>;
    }

    return (
        <DataTable
            columns={columns}
            data={data}
            setDataAction={setData}
            categoryName={categoryName}
            organizationName={organizationName}
        />
    );
}
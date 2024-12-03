"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { columns } from "../../inventory/columns";
import { DataTable } from "../../inventory/data-table";
import { Product } from "@/data/product_example";

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

    return response.json();
}

export default function DataTablePage() {
    const searchParams = useSearchParams();
    const organizationId = searchParams.get("organizationId");
    const categoryId = searchParams.get("categoryId");

    const resource = `${organizationId}/${categoryId}`; // Updated resource construction

    const [data, setData] = useState<Product[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            if (!organizationId || !categoryId) {
                setError("Invalid parameters");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const fetchedData = await fetchData(resource);
                setData(fetchedData);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [organizationId, categoryId]);

    // Handle the loading state
    if (loading) {
        return (
            <div className="container">
                <p>Loading...</p>
            </div>
        );
    }

    // Handle the error state
    if (error) {
        return (
            <div className="container">
                <p>Error loading data: {error}</p>
            </div>
        );
    }

    // Handle the empty state (no data)
    if (!data || data.length === 0) {
        return (
            <div className="container">
                <p>No data available for this category.</p>
            </div>
        );
    }

    // Render the DataTable with data
    return (
        <div className="container">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
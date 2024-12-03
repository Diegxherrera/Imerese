'use client'

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Product } from "@/data/product_example";

async function fetchData(resource: string): Promise<Product[]> {
    const response = await fetch(`/api${resource}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store", // Ensure fresh data on every request
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.json();
}

export default function DataTablePage() {
    const searchParams = useSearchParams();
    const resource = searchParams.get("resource") || "/products"; // Default to /products if not specified

    const [data, setData] = useState<Product[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
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
    }, [resource]); // Re-fetch data when the resource changes

    if (loading) {
        return (
            <div className="container">
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <p>Error loading data: {error}</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="container">
                <p>No data available.</p>
            </div>
        );
    }

    return (
        <div className="container">
            <DataTable columns={columns} data={data} />
        </div>
    );
}

"use client";

import { usePathname } from "next/navigation";
import DashboardPage from "@/components/DashboardPage";

export default function OrganizationDashboard() {
    const pathname = usePathname(); // Access the current path

    // Extract `organizationId` from the path dynamically
    const organizationId = pathname.split("/")[2]; // Assumes `/dashboard/[organizationId]` structure

    if (!organizationId) {
        return <p>Invalid organization</p>;
    }

    return <DashboardPage organizationName={organizationId} />;
}
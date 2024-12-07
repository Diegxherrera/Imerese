"use client";

import { usePathname } from "next/navigation"; // Import usePathname
import Image from "next/image"; // For displaying the organization's image
import { data as navigationData } from "@/components/app-sidebar"; // Renamed to avoid conflicts

export default function DynamicOrganizationLabel() {
    const pathname = usePathname(); // Get the current pathname
    const segments = pathname?.split("/").filter(Boolean) || []; // Extract path segments
    const organizationName = segments[1]; // Assuming the second segment is the organization ID

    // Find the matching organization based on the organizationId in the path
    const organization = navigationData.navMain.find((org) =>
        org.url.includes(organizationName)
    );

    if (!organization) {
        // Return nothing if no organization matches
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <Image
                src={organization.image} // Organization's image URL
                alt={organization.title} // Alternative text for the image
                width={25}
                height={25}
                className="rounded-full"
            />
            <span>{organization.title}</span>
        </div>
    );
}
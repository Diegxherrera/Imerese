"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // Import usePathname
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { data as navigationData } from "@/components/app-sidebar"; // Renamed to avoid conflicts

type NavigationItem = {
    title: string;
    url: string;
    isActive?: boolean;
    items?: NavigationItem[];
};

type BreadcrumbItemType = {
    title: string;
    url: string;
};

function findBreadcrumbData(
    navItems: NavigationItem[],
    pathSegments: string[]
): BreadcrumbItemType[] {
    const breadcrumb: BreadcrumbItemType[] = [];
    let currentItems = navItems;

    for (const segment of pathSegments) {
        const matchedItem = currentItems.find(
            (item) => item.url.split("/").pop() === segment
        );

        if (matchedItem) {
            breadcrumb.push({ title: matchedItem.title, url: matchedItem.url });
            currentItems = matchedItem.items || [];
        } else {
            break; // Stop if no further match is found
        }
    }

    return breadcrumb;
}

export default function DynamicBreadcrumb() {
    const pathname = usePathname(); // Get the current pathname
    const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItemType[]>([]);

    useEffect(() => {
        if (pathname) {
            const pathSegments = pathname.split("/").filter(Boolean);
            const breadcrumbs = findBreadcrumbData(navigationData.navMain, pathSegments);
            setBreadcrumbItems(breadcrumbs);
        }
    }, [pathname]); // Recalculate breadcrumbs when the pathname changes

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((crumb, index) => (
                    <BreadcrumbItem key={index}>
                        {index < breadcrumbItems.length - 1 ? (
                            <>
                                <BreadcrumbLink href={crumb.url}>{crumb.title}</BreadcrumbLink>
                                <BreadcrumbSeparator />
                            </>
                        ) : (
                            <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        )}
                    </BreadcrumbItem>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
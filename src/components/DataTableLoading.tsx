import { Skeleton } from "@/components/ui/skeleton"
import React from "react";

export default function DataTableLoading() {
    return (
        <div>
            <div className="flex flex-row justify-between mb-3">
                <Skeleton className="ml-1 h-10 w-96">
                </Skeleton>
                <div className="flex flex-row">
                    <Skeleton>
                        <Skeleton>
                            <Skeleton className="ml-auto w-44 h-10">

                            </Skeleton>
                        </Skeleton>
                    </Skeleton>
                    <Skeleton
                        className="max-w-sm ml-4 w-44 h-10"
                    />
                </div>
            </div>
            <Skeleton className="rounded-md border w-1/2 md:w-1/2 lg:w-full h-[200px] flex items-center justify-center outline outline-blue-100" data-sidebar="menu-skeleton-text">
                We&#39;re heavy on it 💪
            </Skeleton>
            <div className="flex flex-row py-4">
                <Skeleton className="flex-1 text-sm text-muted-foreground">
                </Skeleton>
            </div>
        </div>
    )
}
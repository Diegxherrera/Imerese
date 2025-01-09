"use client";

import {CategoriesPieChart} from "@/components/PieChart";
import InventoryTotal from "@/components/InventoryTotal";
import { StatusPieChart } from "@/components/StatusPieChart";
import {LineChartInteractive} from "@/components/LineChartInteractive";

export default function DashboardPage({ organizationName }: { organizationName: string }) {

    return (
        <div className="flex flex-col space-y-7 justify-between">
            <div className="flex flex-row space-x-2">
                <InventoryTotal organizationName={organizationName} />
                <CategoriesPieChart  organizationName={organizationName}/>
                <StatusPieChart  organizationName={organizationName}/>
            </div>
            <div className="w-auto">
                <LineChartInteractive />
            </div>
        </div>
    );
}
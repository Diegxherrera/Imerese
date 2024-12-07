"use client"

import * as React from "react"
import {
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavTools } from "@/components/nav-tools"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export const data = {
  user: {
    name: "Jose Carlos",
    email: "jc@nebrija.es",
    avatar: "",
  },
  navMain: [
    {
      title: "Instituto Nebrija",
      url: "/dashboards/nebrija",
      image: "/nebrija.jpg",
      isActive: true,
      items: [
        {
          title: "Dispositivos",
          url: "/inventory/nebrija/devices",
        },
        {
          title: "Activos Digitales",
          url: "/inventory/nebrija/digital_assets",
        },
        {
          title: "Materiales",
          url: "/inventory/nebrija/materials",
        },
      ],
    },
    {
      title: "IFPS Puenteuropa",
      url: "/dashboards/puenteuropa",
      image: "/puenteuropa.jpg",
      items: [
        {
          title: "Dispositivos",
          url: "/inventory/puenteuropa/devices",
        },
        {
          title: "Activos Digitales",
          url: "/inventory/puenteuropa/digital_assets",
        },
        {
          title: "Materiales",
          url: "/inventory/puenteuropa/materials",
        },
      ],
    },
    {
      title: "Alcazarén Formación",
      url: "/dashboards/alcazaren",
      image: "/alcazaren.jpg",
      items: [
        {
          title: "Dispositivos",
          url: "/inventory/alcazaren/devices",
        },
        {
          title: "Activos Digitales",
          url: "/inventory/alcazaren/digital_assets",
        },
        {
          title: "Materiales",
          url: "/inventory/alcazaren/materials",
        },
      ],
    },
    {
      title: "Fundación CNSE",
      url: "/dashboards/cnse",
      image: "/cnse.png",
      items: [
        {
          title: "Dispositivos",
          url: "/inventory/cnse/devices",
        },
        {
          title: "Activos Digitales",
          url: "/inventory/cnse/digital_assets",
        },
        {
          title: "Materiales",
          url: "/inventory/cnse/materials",
        },
        {
          title: "Servicios prestados/por prestar",
          url: "/inventory/cnse/services",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Soporte",
      url: "/support",
      icon: LifeBuoy,
    },
  ],
  tools: [
    {
      name: "Diseño de pedidos",
      url: "#",
      icon: Frame,
    },
    {
      name: "Estadísticas",
      url: "#",
      icon: PieChart,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-600 text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Proyectos Solidarios</span>
                  <span className="truncate text-xs">Powered by Imerese</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavTools tools={data.tools} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

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
import { NavProjects } from "@/components/nav-projects"
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
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Instituto Nebrija",
      url: "/dashboards/instituto_nebrija",
      image: "/nebrija.jpg",
      isActive: true,
      items: [
        {
          title: "Dispositivos",
          url: "/categories/devices/instituto_nebrija",
        },
        {
          title: "Activos Digitales",
          url: "/categories/digital/instituto_nebrija",
        },
        {
          title: "Materiales",
          url: "/categories/materials/instituto_nebrija",
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
          url: "/categories/devices/puenteuropa",
        },
        {
          title: "Activos Digitales",
          url: "/categories/digital/puenteuropa",
        },
        {
          title: "Materiales",
          url: "/categories/materials/puenteuropa",
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
          url: "/categories/devices/alcazaren",
        },
        {
          title: "Activos Digitales",
          url: "/categories/digital/alcazaren",
        },
        {
          title: "Materiales",
          url: "/categories/materials/alcazaren",
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
          url: "/categories/devices/cnse",
        },
        {
          title: "Activos Digitales",
          url: "/categories/digital/cnse",
        },
        {
          title: "Materiales",
          url: "/categories/materials/cnse",
        },
        {
          title: "Servicios prestados/por prestar",
          url: "/categories/materials/cnse",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

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
                  <span className="truncate font-semibold">Signalee</span>
                  <span className="truncate text-xs">Proyectos Solidarios</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {AppSidebar} from "@/components/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: `Imerese`,
  description: "Powered by Imerese Technologies ©",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1"/>
              <Separator orientation="vertical" className="mr-2 h-4"/>
              <DynamicBreadcrumb/>
            </div>
          </header>
          <main className="mx-10">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      </body>
    </html>
  );
}

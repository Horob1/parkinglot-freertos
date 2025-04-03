import { authStore } from "@/store";
import { Navigate, Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSideBar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "../ModeToggle";
import { useEffect, useState } from "react";
import { LayoutContext } from "@/hooks/use-layout";

export const MainLayout = () => {
  const { auth } = authStore();
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const header = document.getElementById("app-header");
      if (header) {
        setContentHeight(window.innerHeight - header.offsetHeight - 16);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  if (!auth) return <Navigate to="/auth" replace />;
  return (
    <LayoutContext.Provider value={contentHeight}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header
            id="app-header"
            className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4"
          >
            <SidebarTrigger className="-ml-1 border-[1px]" />
            <div className="flex-1" />
            <ModeToggle />
          </header>
          <div
            className="flex-1 p-2"
          >
            <Outlet></Outlet>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </LayoutContext.Provider>
  );
};

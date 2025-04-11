import * as React from "react";

import { NavUser } from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Home, IdCard, Logs, Settings, UserRoundCheck } from "lucide-react";
import clsx from "clsx";

// This is sample data.
const data = {
  user: {
    name: "Admin",
    email: "admin@parkinglot.com",
    avatar: "https://github.com/shadcn.png",
  },
};

const items = [
  {
    name: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    name: "Card",
    url: "/card",
    icon: IdCard,
  },
  {
    name: "Log",
    url: "/log",
    icon: Logs,
  },
  {
    name: "Client",
    url: "/client",
    icon: UserRoundCheck,
  },
  {
    name: "Setting",
    url: "/setting",
    icon: Settings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem
              className={clsx(
                location.pathname === item.url && "bg-sidebar-accent"
              )}
              key={item.url}
            >
              <Link
                to={item.url}
                className="flex items-center gap-2 px-3 py-2 transition-transform duration-200 hover:translate-x-2  hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <item.icon className="ml-2 text-lg" />
                <span className="font-normal">{item.name}</span>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

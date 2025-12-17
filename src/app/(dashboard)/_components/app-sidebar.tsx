"use client";

import {
  Building2,
  ChevronUp,
  History,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Megaphone,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  Type,
  User2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { isAdminUser } from "@/features/admin";
import { getUserDisplayName, getUserPhotoUrl, useCurrentUser, useLogout } from "@/features/auth";
import { ROUTES } from "@/shared/lib/constants";

const navigation = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: ROUTES.HOME, icon: LayoutDashboard },
      { name: "Accounts", href: ROUTES.ACCOUNTS, icon: Building2 },
      { name: "Campaigns", href: ROUTES.CAMPAIGNS, icon: Megaphone },
      { name: "Recommendations", href: ROUTES.RECOMMENDATIONS, icon: Lightbulb },
    ],
  },
  {
    label: "Reports",
    items: [
      { name: "Search Terms", href: ROUTES.SEARCH_TERMS, icon: Search },
      { name: "Conversions", href: ROUTES.CONVERSIONS, icon: Target },
      { name: "Change History", href: ROUTES.CHANGE_HISTORY, icon: History },
    ],
  },
  {
    label: "Optimizer",
    items: [
      { name: "Text Optimizer", href: ROUTES.OPTIMIZER_TEXT, icon: Type },
      { name: "Smart Optimizer", href: ROUTES.OPTIMIZER_SMART, icon: Sparkles },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const showAdminSection = user && isAdminUser(user);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROUTES.HOME}>
                <Image
                  src="/images/logo.png"
                  alt="Fixads"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Fixads</span>
                  <span className="text-xs text-muted-foreground">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {showAdminSection && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === ROUTES.ADMIN}>
                    <Link href={ROUTES.ADMIN}>
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user ? getUserPhotoUrl(user) : undefined}
                      alt={user ? getUserDisplayName(user) : undefined}
                    />
                    <AvatarFallback>
                      {user ? getInitials(getUserDisplayName(user)) : <User2 className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">{user ? getUserDisplayName(user) : "User"}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                align="start"
              >
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.SETTINGS}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

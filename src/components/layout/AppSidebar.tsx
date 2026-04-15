"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  ChevronRight, 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  FileText, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  Megaphone,
  Store
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
        }
      ],
    },
    {
      title: "Product Management",
      url: "#",
      icon: ShoppingBag,
      items: [
        {
          title: "All Products",
          url: "/admin/products",
        },
        {
          title: "Add Product",
          url: "/admin/products/new",
        },
        {
          title: "Categories",
          url: "/admin/categories",
        },
      ],
    },
    {
      title: "Sales & Orders",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "All Orders",
          url: "/admin/orders",
        },
      ],
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: "/admin/users",
        },
      ],
    },
    {
      title: "CMS Manager",
      url: "#",
      icon: ImageIcon,
      items: [
        {
          title: "Content Studio",
          url: "/admin/cms",
        },
        {
          title: "Blog Posts",
          url: "/admin/blogs",
        },
      ],
    },
    {
      title: "System Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Marketing Tools",
          url: "/admin/marketing",
        },
        {
          title: "General Settings",
          url: "/admin/settings",
        },
      ],
    },
  ],
}

interface NavGroupProps {
  item: typeof data.navMain[0]
  pathname: string
}

function NavGroup({ item, pathname }: NavGroupProps) {
  const isParentActive = React.useMemo(() => 
    item.items.some(subItem => pathname === subItem.url) || pathname === item.url,
    [item.items, item.url, pathname]
  )
  
  const [open, setOpen] = React.useState(isParentActive)

  // Sync open state with navigation
  React.useEffect(() => {
    if (isParentActive) {
      setOpen(true)
    }
  }, [isParentActive])

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarGroup>
        <SidebarGroupLabel
          render={<CollapsibleTrigger />}
          className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {item.items.map((subItem) => (
                <SidebarMenuItem key={subItem.title}>
                  <SidebarMenuButton 
                    render={<Link href={subItem.url} />} 
                    isActive={pathname === subItem.url}
                  >
                    {subItem.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b h-14 lg:h-[60px] px-6 flex items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Store className="h-6 w-6 text-primary" />
          <span className="text-xl tracking-tight">Janopriyo</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {data.navMain.map((item) => (
          <NavGroup key={item.title} item={item} pathname={pathname} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

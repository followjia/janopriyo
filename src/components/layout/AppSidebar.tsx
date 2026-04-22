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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
          title: "Banners",
          url: "/admin/cms/banners",
        },
        {
          title: "FAQs",
          url: "/admin/cms/faqs",
        },
      ],
    },
    {
      title: "Blogs",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Manage Blog",
          url: "/admin/blogs",
        },
        {
          title: "Add New Blog",
          url: "/admin/blogs/new",
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


function NavMain({ items, pathname }: { items: typeof data.navMain; pathname: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isParentActive =
            item.items.some(
              (subItem) =>
                pathname === subItem.url ||
                (subItem.url !== "#" &&
                  subItem.url !== "/admin" &&
                  pathname.startsWith(subItem.url))
            ) || pathname === item.url

          return (
            <Collapsible
              key={item.title}
              defaultOpen={isParentActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} isActive={isParentActive} />}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-open/collapsible:rotate-90 group-[[data-state=open]]/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          render={<Link href={subItem.url} />}
                          isActive={
                            pathname === subItem.url ||
                            (subItem.url !== "#" &&
                              subItem.url !== "/admin" &&
                              pathname.startsWith(subItem.url))
                          }
                        >
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
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
        <NavMain items={data.navMain} pathname={pathname} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

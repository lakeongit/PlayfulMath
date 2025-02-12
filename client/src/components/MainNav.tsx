import { Link, useLocation } from "wouter";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { BookOpen, Brain, BarChart3, Home, Calendar, UserCircle } from "lucide-react";

export default function MainNav() {
  const [location] = useLocation();

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/practice", label: "Practice", icon: BookOpen },
    { href: "/memory-cards", label: "Memory Cards", icon: Brain },
    { href: "/daily-puzzle", label: "Daily Puzzle", icon: Calendar },
    { href: "/progress", label: "Progress", icon: BarChart3 },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <NavigationMenu className="max-w-full w-screen justify-center">
      <NavigationMenuList className="space-x-2">
        {menuItems.map(({ href, label, icon: Icon }) => (
          <NavigationMenuItem key={href}>
            <Link href={href}>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "flex items-center gap-2",
                  location === href && "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
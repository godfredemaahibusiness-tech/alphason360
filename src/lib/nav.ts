import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  ClipboardList,
  CalendarCheck,
  UserSquare2,
  MessageSquare,
  BookOpen,
  Bus,
  BarChart3,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, phase: 1 },
  { href: "/students", label: "Students", icon: Users, phase: 1 },
  { href: "/academics", label: "Academics", icon: GraduationCap, phase: 1 },
  { href: "/finance", label: "Finance", icon: Wallet, phase: 1 },
  { href: "/admissions", label: "Admissions", icon: ClipboardList, phase: 1 },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck, phase: 1 },
  { href: "/staff", label: "Staff", icon: UserSquare2, phase: 1 },
  { href: "/communication", label: "Communication", icon: MessageSquare, phase: 1 },
  { href: "/library", label: "Library", icon: BookOpen, phase: 1 },
  { href: "/transport", label: "Transport", icon: Bus, phase: 1 },
  { href: "/reports", label: "Reports", icon: BarChart3, phase: 1 },
  { href: "/settings", label: "Settings", icon: Settings, phase: 1 },
] as const;

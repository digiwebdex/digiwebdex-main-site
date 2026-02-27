import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  Package,
  Tag,
  ShoppingCart,
  FileText,
  CreditCard,
  ArrowLeftRight,
  RefreshCcw,
  CalendarDays,
  AlertTriangle,
  XCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  MessageCircle,
  Send,
  ScrollText,
  Mail,
  MailOpen,
  Settings,
  Building2,
  Receipt,
  Wallet,
  MessageSquare,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Globe,
  Server,
  FolderKanban,
  FileEdit,
  Search,
  Radar,
  Layout,
  Palette,
  Headphones,
  FormInput,
  Bell,
  FileCheck,
  Contact,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: { label: string; href: string }[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { language } = useLanguage();
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const basePath = language === 'en' ? '/en' : '/bn';

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const menuSections: MenuSection[] = [
    {
      title: language === 'bn' ? 'মূল মেনু' : 'Main',
      items: [
        { label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard, href: `${basePath}/admin` },
      ],
    },
    {
      title: language === 'bn' ? 'কাস্টমার' : 'Customers',
      items: [
        {
          label: language === 'bn' ? 'কাস্টমার' : 'Customers', icon: Users,
          children: [
            { label: language === 'bn' ? 'সকল কাস্টমার' : 'All Customers', href: `${basePath}/admin/customers` },
            { label: language === 'bn' ? 'কাস্টমার লেজার' : 'Customer Ledger', href: `${basePath}/admin/customers/ledger` },
          ],
        },
        { label: language === 'bn' ? 'লিডস' : 'Leads', icon: UserPlus, href: `${basePath}/admin/leads` },
        { label: language === 'bn' ? 'প্রস্তাবনা' : 'Proposals', icon: FileCheck, href: `${basePath}/admin/proposals` },
      ],
    },
    {
      title: language === 'bn' ? 'সার্ভিস ও প্যাকেজ' : 'Services & Packages',
      items: [
        { label: language === 'bn' ? 'সার্ভিস ক্যাটাগরি' : 'Service Categories', icon: Package, href: `${basePath}/admin/services` },
        { label: language === 'bn' ? 'প্যাকেজ' : 'Packages', icon: Tag, href: `${basePath}/admin/packages` },
      ],
    },
    {
      title: language === 'bn' ? 'অর্ডার ও বিলিং' : 'Orders & Billing',
      items: [
        { label: language === 'bn' ? 'অর্ডারসমূহ' : 'Orders', icon: ShoppingCart, href: `${basePath}/admin/orders` },
        { label: language === 'bn' ? 'ইনভয়েস' : 'Invoices', icon: FileText, href: `${basePath}/admin/invoices` },
        { label: language === 'bn' ? 'পেমেন্ট ভেরিফিকেশন' : 'Payments', icon: CreditCard, href: `${basePath}/admin/payments` },
      ],
    },
    {
      title: language === 'bn' ? 'সাবস্ক্রিপশন' : 'Subscriptions',
      items: [
        {
          label: language === 'bn' ? 'সাবস্ক্রিপশন' : 'Subscriptions', icon: RefreshCcw,
          children: [
            { label: language === 'bn' ? 'অ্যাক্টিভ সার্ভিস' : 'Active Services', href: `${basePath}/admin/subscriptions` },
            { label: language === 'bn' ? 'ডোমেইন' : 'Domains', href: `${basePath}/admin/domains` },
            { label: language === 'bn' ? 'হোস্টিং' : 'Hosting', href: `${basePath}/admin/hosting` },
          ],
        },
      ],
    },
    {
      title: language === 'bn' ? 'রিপোর্ট' : 'Reports',
      items: [
        { label: language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics', icon: BarChart3, href: `${basePath}/admin/analytics` },
        { label: language === 'bn' ? 'ট্র্যাকিং' : 'Tracking', icon: Radar, href: `${basePath}/admin/tracking` },
      ],
    },
    {
      title: language === 'bn' ? 'প্রজেক্ট ও কন্টেন্ট' : 'Projects & Content',
      items: [
        { label: language === 'bn' ? 'প্রজেক্ট' : 'Projects', icon: FolderKanban, href: `${basePath}/admin/projects` },
        { label: language === 'bn' ? 'ব্লগ' : 'Blog', icon: FileEdit, href: `${basePath}/admin/blog` },
        { label: language === 'bn' ? 'SEO সেটিংস' : 'SEO', icon: Search, href: `${basePath}/admin/seo` },
        { label: language === 'bn' ? 'হোমপেজ' : 'Homepage CMS', icon: Layout, href: `${basePath}/admin/homepage` },
        { label: language === 'bn' ? 'প্রপোজাল টেমপ্লেট' : 'Proposal Templates', icon: Palette, href: `${basePath}/admin/proposal-templates` },
      ],
    },
    {
      title: language === 'bn' ? 'সাপোর্ট ও কমিউনিকেশন' : 'Support',
      items: [
        { label: language === 'bn' ? 'টিকেট' : 'Tickets', icon: Headphones, href: `${basePath}/admin/tickets` },
        { label: language === 'bn' ? 'চ্যাটবট লগ' : 'Chatbot Logs', icon: MessageSquare, href: `${basePath}/admin/chatbot` },
        { label: language === 'bn' ? 'নোটিফিকেশন টেমপ্লেট' : 'Notifications', icon: Bell, href: `${basePath}/admin/notifications` },
      ],
    },
    {
      title: language === 'bn' ? 'সেটিংস' : 'Settings',
      items: [
        {
          label: language === 'bn' ? 'সেটিংস' : 'Settings', icon: Settings,
          children: [
            { label: language === 'bn' ? 'সিস্টেম সেটিংস' : 'System Settings', href: `${basePath}/admin/settings` },
            { label: language === 'bn' ? 'ব্যবহারকারী' : 'Admin Users', href: `${basePath}/admin/users` },
            { label: language === 'bn' ? 'রিসেলার' : 'Resellers', href: `${basePath}/admin/resellers` },
            { label: language === 'bn' ? 'কাস্টম ফিল্ড' : 'Custom Fields', href: `${basePath}/admin/custom-fields` },
            { label: language === 'bn' ? 'পারমিশন' : 'Permissions', href: `${basePath}/admin/permissions` },
          ],
        },
      ],
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = basePath;
  };

  const isPathActive = (href: string) => location.pathname === href;
  const isGroupActive = (children: { href: string }[]) => children.some(c => location.pathname === c.href);

  const renderMenuItem = (item: MenuItem, sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;

    // Simple link item
    if (item.href && !item.children) {
      const active = isPathActive(item.href);
      return (
        <Link
          key={key}
          to={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
            active
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? item.label : undefined}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      );
    }

    // Collapsible group item
    if (item.children) {
      const groupActive = isGroupActive(item.children);
      const isOpen = openGroups[key] ?? groupActive;

      if (collapsed) {
        // In collapsed mode, show just the icon linking to first child
        return (
          <Link
            key={key}
            to={item.children[0].href}
            className={cn(
              'flex items-center justify-center rounded-lg px-2 py-2 text-sm transition-colors',
              groupActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
            title={item.label}
          >
            <item.icon className="h-4 w-4 shrink-0" />
          </Link>
        );
      }

      return (
        <div key={key}>
          <button
            onClick={() => toggleGroup(key)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors w-full',
              groupActive
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
          </button>
          {isOpen && (
            <div className="ml-7 mt-0.5 space-y-0.5 border-l border-border pl-3">
              {item.children.map((child) => {
                const childActive = isPathActive(child.href);
                return (
                  <Link
                    key={child.href}
                    to={child.href}
                    className={cn(
                      'block rounded-md px-3 py-1.5 text-sm transition-colors',
                      childActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-card overflow-y-auto transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center justify-between border-b px-4 sticky top-0 bg-card z-10">
            {!collapsed && (
              <Link to={basePath} className="flex items-center gap-2">
                <img src={logo} alt="DigiWebDex" className="h-7 w-auto" />
                <span className="font-bold text-base">Admin</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn('h-8 w-8', collapsed && 'mx-auto')}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Back to Site */}
          <div className="px-3 py-1.5 border-b">
            <Link
              to={basePath}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
                collapsed && 'justify-center px-2'
              )}
            >
              <Home className="h-4 w-4 shrink-0" />
              {!collapsed && (language === 'bn' ? 'সাইটে ফিরুন' : 'Back to Site')}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {!collapsed && (
                  <h3 className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item, itemIndex) => renderMenuItem(item, sectionIndex, itemIndex))}
                </div>
              </div>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="border-t p-3 sticky bottom-0 bg-card">
            {!collapsed && user && (
              <div className="mb-1.5 text-xs text-muted-foreground truncate">
                {user.email}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-2')}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && (language === 'bn' ? 'লগআউট' : 'Logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="container-custom py-8">{children}</div>
      </main>
    </div>
  );
}

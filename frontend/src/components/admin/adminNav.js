import { DollarSign, LayoutDashboard, Users } from 'lucide-react';

export const ADMIN_ACCENT = '#f59e0b';

export const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/payouts', label: 'Payouts', icon: DollarSign },
];

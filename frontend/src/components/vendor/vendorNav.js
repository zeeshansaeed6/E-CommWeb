import { LayoutDashboard, Package, ShoppingBag } from 'lucide-react';

export const VENDOR_ACCENT = '#0071e3';

export const VENDOR_NAV = [
  { to: '/vendor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/vendor/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/vendor/products', label: 'Catalogue', icon: Package },
];

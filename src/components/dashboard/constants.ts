import { NavTabItem } from './types'
import { getBentoCache } from '@/lib/bentoCache'

export const getSuperAdminNavTabs = (tenantCount?: number): NavTabItem[] => {
  const resolvedCount = tenantCount ?? getBentoCache<any>('superadmin:stats')?.data?.total_tenants
  return [
    { id: 'overview', label: 'Ringkasan', href: '/superadmin/dashboard' },
    { id: 'tenants', label: 'Sekolah', href: '/superadmin/tenants', badge: resolvedCount },
    { id: 'finance', label: 'Keuangan', href: '/superadmin/finance' },
    { id: 'pricing', label: 'Harga & Kuota', href: '/superadmin/pricing' },
    { id: 'secrets', label: 'Sistem', href: '/superadmin/secrets' },
    { id: 'analytics', label: 'Audit Nilai', href: '/analytics' },
  ]
}


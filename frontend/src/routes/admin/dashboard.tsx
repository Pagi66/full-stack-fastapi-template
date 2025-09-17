import { createFileRoute } from '@tanstack/react-router'
import { Dashboard as AdminDashboard } from '@/pages/admin-dashboard'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboard,
})
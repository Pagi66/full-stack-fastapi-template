import { createFileRoute } from '@tanstack/react-router'
import { UserDashboard } from '@/pages/user-dashboard'

export const Route = createFileRoute('/dashboard')({
  component: UserDashboard,
})
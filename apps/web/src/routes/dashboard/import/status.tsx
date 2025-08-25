import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/dashboard/import/status')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/import/status"!</div>
}

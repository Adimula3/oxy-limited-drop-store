import DropForm from '@/components/admin/DropForm'

export const metadata = { title: 'New Drop — Admin' }

export default function NewDropPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">New Drop</h1>
      <DropForm />
    </div>
  )
}

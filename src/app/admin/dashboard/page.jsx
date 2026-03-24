export const metadata = { title: 'Dashboard' }

const stats = ['Total Drops', 'Active Drops', 'Total Orders']

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((label) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
            <p className="mt-3 text-4xl font-bold">—</p>
          </div>
        ))}
      </div>
    </div>
  )
}

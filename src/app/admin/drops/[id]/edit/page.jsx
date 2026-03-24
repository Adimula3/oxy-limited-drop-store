import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import DropForm from '@/components/admin/DropForm'

export async function generateMetadata({ params }) {
  const { id } = await params
  const drop = await prisma.drop.findUnique({ where: { id } })
  return { title: `Edit ${drop?.name ?? 'Drop'} — Admin` }
}

export default async function EditDropPage({ params }) {
  const { id } = await params

  const drop = await prisma.drop.findUnique({
    where: { id },
    include: { products: true },
  })

  if (!drop) notFound()

  const initialData = {
    name: drop.name,
    slug: drop.slug,
    description: drop.description ?? '',
    coverImage: drop.coverImage ?? '',
    scheduledAt: drop.scheduledAt
      ? new Date(drop.scheduledAt).toISOString().slice(0, 16)
      : '',
    endsAt: drop.endsAt
      ? new Date(drop.endsAt).toISOString().slice(0, 16)
      : '',
    maxPerUser: drop.maxPerUser,
    status: drop.status,
    products: drop.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: (p.price / 100).toFixed(2),
      stock: p.stock,
      sku: p.sku ?? '',
      image: p.image ?? '',
      gender: p.gender,
      type: p.type,
    })),
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Edit Drop</h1>
      <DropForm initialData={initialData} dropId={id} />
    </div>
  )
}

'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import ImageUpload from '@/components/ui/ImageUpload'

function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
}

const GENDERS = [
  { value: 'UNISEX', label: 'Unisex' },
  { value: 'MEN', label: 'Men' },
  { value: 'WOMEN', label: 'Women' },
  { value: 'KIDS', label: 'Kids' },
]

const TYPES = [
  { value: 'APPAREL', label: 'Apparel' },
  { value: 'OXY', label: 'OxY' },
  { value: 'LIFESTYLE', label: 'Lifestyle' },
  { value: 'FOOTWEAR', label: 'Footwear' },
  { value: 'BRANDS', label: 'Brands' },
]

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Required'),
  price: z.string().min(1, 'Required'),
  stock: z.coerce.number().int().min(0, 'Must be 0 or more'),
  sku: z.string().optional(),
  image: z.string().optional(),
  gender: z.enum(['UNISEX', 'MEN', 'WOMEN', 'KIDS']),
  type: z.enum(['OXY', 'APPAREL', 'LIFESTYLE', 'FOOTWEAR', 'BRANDS']),
})

const dropSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z
    .string()
    .min(1, 'Required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  scheduledAt: z.string().optional(),
  endsAt: z.string().optional(),
  maxPerUser: z.coerce.number().int().min(1),
  status: z.enum(['UPCOMING', 'LIVE', 'SOLD_OUT', 'ENDED']),
  products: z.array(productSchema).min(1, 'Add at least one product'),
})

const INPUT = 'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none'
const LABEL = 'mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500'

const defaultProduct = { name: '', price: '', stock: 0, sku: '', image: '', gender: 'UNISEX', type: 'APPAREL', id: undefined }

export default function DropForm({ initialData, dropId }) {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const isEdit = !!dropId

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(dropSchema),
    defaultValues: initialData ?? {
      name: '',
      slug: '',
      description: '',
      coverImage: '',
      scheduledAt: '',
      endsAt: '',
      maxPerUser: 1,
      status: 'UPCOMING',
      products: [{ ...defaultProduct }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'products' })

  const nameValue = watch('name')
  useEffect(() => {
    if (!isEdit) setValue('slug', toSlug(nameValue))
  }, [nameValue, isEdit, setValue])

  async function onSubmit(data) {
    setServerError('')
    const url = isEdit ? `/api/drops/${dropId}` : '/api/drops'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        coverImage: data.coverImage || null,
        description: data.description || null,
        scheduledAt: data.scheduledAt || null,
        endsAt: data.endsAt || null,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setServerError(body.error ?? 'Something went wrong')
      return
    }

    router.push('/admin/drops')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Drop details */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Drop Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Name</label>
            <input {...register('name')} className={INPUT} placeholder="Air Force 1 '25" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className={LABEL}>Slug</label>
            <input {...register('slug')} className={INPUT} placeholder="air-force-1-25" />
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
          </div>

          <div>
            <label className={LABEL}>Status</label>
            <select {...register('status')} className={INPUT}>
              {['UPCOMING', 'LIVE', 'SOLD_OUT', 'ENDED'].map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL}>Max Per User</label>
            <input type="number" min="1" {...register('maxPerUser')} className={INPUT} />
          </div>

          <div>
            <label className={LABEL}>Scheduled At</label>
            <input type="datetime-local" {...register('scheduledAt')} className={INPUT} />
          </div>

          <div>
            <label className={LABEL}>Ends At</label>
            <input type="datetime-local" {...register('endsAt')} className={INPUT} />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL}>Cover Image</label>
            <ImageUpload
              value={watch('coverImage') || ''}
              onChange={(url) => setValue('coverImage', url)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL}>Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className={`${INPUT} resize-none`}
              placeholder="Drop description…"
            />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Products</h2>
          <button
            type="button"
            onClick={() => append({ ...defaultProduct })}
            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Add Product
          </button>
        </div>

        {typeof errors.products?.message === 'string' && (
          <p className="mb-4 text-xs text-red-500">{errors.products.message}</p>
        )}

        <div className="space-y-4">
          {fields.map((field, i) => (
            <div
              key={field.id}
              className="rounded-lg border border-zinc-800 p-4"
            >
              {/* Row 1: Name, Price, Stock, SKU */}
              <div className="mb-3 grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-5">
                  <label className="mb-1 block text-xs text-zinc-500">Name</label>
                  <input
                    {...register(`products.${i}.name`)}
                    className={INPUT}
                    placeholder="Nike Air Force 1 Low"
                  />
                  {errors.products?.[i]?.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.products[i].name.message}</p>
                  )}
                </div>

                <div className="col-span-5 sm:col-span-2">
                  <label className="mb-1 block text-xs text-zinc-500">Price ($)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    {...register(`products.${i}.price`)}
                    className={INPUT}
                    placeholder="59.99"
                  />
                  {errors.products?.[i]?.price && (
                    <p className="mt-1 text-xs text-red-500">{errors.products[i].price.message}</p>
                  )}
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <label className="mb-1 block text-xs text-zinc-500">Stock</label>
                  <input
                    type="number"
                    min="0"
                    {...register(`products.${i}.stock`)}
                    className={INPUT}
                  />
                </div>

                <div className="col-span-12 sm:col-span-3">
                  <label className="mb-1 block text-xs text-zinc-500">SKU (optional)</label>
                  <input
                    {...register(`products.${i}.sku`)}
                    className={INPUT}
                    placeholder="AF1-WHT-42"
                  />
                </div>
              </div>

              {/* Row 2: Gender, Type, Delete */}
              <div className="mb-3 grid grid-cols-12 gap-3">
                <div className="col-span-5 sm:col-span-4">
                  <label className="mb-1 block text-xs text-zinc-500">Gender</label>
                  <select {...register(`products.${i}.gender`)} className={INPUT}>
                    {GENDERS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-5 sm:col-span-4">
                  <label className="mb-1 block text-xs text-zinc-500">Type</label>
                  <select {...register(`products.${i}.type`)} className={INPUT}>
                    {TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 flex items-end sm:col-span-4">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-zinc-600 transition-colors hover:text-red-500"
                      aria-label="Remove product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 3: Product Image */}
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Product Image (optional)</label>
                <ImageUpload
                  value={watch(`products.${i}.image`) || ''}
                  onChange={(url) => setValue(`products.${i}.image`, url)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Drop'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/drops')}
          className="rounded-lg border border-zinc-700 px-8 py-3 text-xs font-medium uppercase tracking-widest text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

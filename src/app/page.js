import Link from 'next/link'

export const metadata = { title: 'OxY — Limited Drops' }

export default function SplashPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <p className="mb-6 text-xs uppercase tracking-[0.6em] text-zinc-600">
        Limited Drops
      </p>

      <h1 className="mb-6 text-[clamp(5rem,20vw,14rem)] font-bold leading-none tracking-tighter">
        OxY
      </h1>

      <p className="mb-12 max-w-xs text-sm text-zinc-500">
        Exclusive limited-edition releases.
        <br />
        Each piece is yours — if you&apos;re quick enough.
      </p>

      <Link
        href="/store"
        className="inline-flex h-12 items-center rounded-full bg-white px-14 text-xs font-bold uppercase tracking-[0.3em] text-black transition-colors hover:bg-zinc-200"
      >
        Shop
      </Link>
    </div>
  )
}

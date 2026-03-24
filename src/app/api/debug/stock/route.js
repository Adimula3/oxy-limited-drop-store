import { NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const value = await redis.get(`stock:product:${productId}`)
  return NextResponse.json({ productId, redisValue: value })
}

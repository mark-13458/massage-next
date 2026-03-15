import { NextRequest } from 'next/server'

export function getIpAddress(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || null
  }
  // Fallback for vercel deployment
  const vercelIp = request.headers.get('x-vercel-forwarded-for')
  if (vercelIp) {
    return vercelIp.split(',')[0]?.trim() || null
  }
  // Fallback for local development or other environments if needed
  return request.ip || null 
}
type AdminApiSuccess<T> = {
  status: 'ok'
  data: T | null
}

type AdminApiError = {
  status: 'error'
  error: string
}

type AdminApiResponse<T> = AdminApiSuccess<T> | AdminApiError

export async function adminRequest<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init)
  const json = (await response.json().catch(() => ({}))) as Partial<AdminApiResponse<T>>

  if (!response.ok) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Request failed')
  }

  return (json.data ?? null) as T | null
}

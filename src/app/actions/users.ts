'use server'

import type { User } from '@/types/user'

export type GetUsersParams = {
  name: string
}

export async function getUsers(params?: GetUsersParams): Promise<User[]> {
  const url = new URL(process.env.API_URL as string)

  if (params?.name) {
    url.searchParams.append('name', params.name)
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (response.statusText !== 'OK') {
    throw new Error('Error fetching data', {
      cause: response.statusText
    })
  }

  const data = await response.json()

  return data
}

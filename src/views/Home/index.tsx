'use client'

import { useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useGetUsers } from '@/hooks/useGetUsers'

const Home = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const params = useMemo(() => {
    const search = searchParams.get('search')

    return {
      name: search || ''
    }
  }, [searchParams])

  const { data: users, isLoading, isError } = useGetUsers(params)

  const handleSearch = useDebouncedCallback((search: string) => {
    const params = new URLSearchParams(searchParams)

    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }

    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <div className='flex items-center justify-center h-screen'>
      <div>
        <div className='flex flex-col gap-1'>
          <label>Usuários</label>
          <input
            name='search'
            className='border-2 border-gray-300 rounded-md p-2 min-w-[250px]'
            type='text'
            placeholder='Buscar usuário'
            defaultValue={params.name}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <div>
          {isLoading ? (
            <div className='border-2 border-gray-300 rounded-md p-2 mt-2'>
              <span>Buscando usuários...</span>
            </div>
          ) : isError ? (
            <div className='border-2 border-red-500 rounded-md p-2 mt-2'>
              <span>Error ao buscar usuários</span>
            </div>
          ) : users?.length ? (
            users.map(user => (
              <div key={user.id} className='border-2 border-gray-300 rounded-md p-2 mt-2'>
                <span>{user.name}</span>
              </div>
            ))
          ) : (
            <div className='border-2 border-gray-300 rounded-md p-2 mt-2'>
              <span>Nenhum usuário encontrado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home

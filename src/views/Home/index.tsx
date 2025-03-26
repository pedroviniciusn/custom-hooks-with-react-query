'use client'

import { Suspense } from 'react'

import { useGetUsers } from '@/hooks/useGetUsers'
import Search from './components/search'

interface HomeProps {
  search: string
}

const Home = (props: HomeProps) => {
  const { data: users, isLoading, isError } = useGetUsers({ name: props.search })

  return (
    <div className='flex items-center justify-center h-screen'>
      <div>
        <Suspense fallback={<div>Carregando...</div>}>
          <Search />
        </Suspense>
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

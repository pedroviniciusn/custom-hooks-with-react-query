# Como Criar Hooks Customizados com React Query e Manipular Query Strings no Next.js 🚀

Hoje quero compartilhar uma abordagem prática para quem trabalha com **React Query** e **Next.js**. Vou mostrar como criar hooks customizados para gerenciar chamadas de API e como manipular query strings na URL de forma simples e eficiente. Vamos lá! 👇

---

## Actions do Users

As actions são responsáveis por realizar as chamadas à API. Aqui está o exemplo usado no projeto:

```typescript
// filepath: /Users/pedrovinicius/Study/get-cookies-server-side/src/app/actions/users.ts
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
```

### Como funciona:
1. A função `getUsers` recebe parâmetros opcionais para filtrar os usuários.
2. Constrói a URL com os parâmetros de busca.
3. Realiza a chamada à API e retorna os dados no formato esperado.

---

## Criando Hooks Customizados com React Query

Os hooks customizados ajudam a centralizar a lógica de chamadas de API e o gerenciamento de estado. Aqui está um exemplo direto do meu projeto:

```typescript
// filepath: /Users/pedrovinicius/Study/get-cookies-server-side/src/hooks/useGetUsers.ts
import { getUsers, type GetUsersParams } from '@/app/actions/users'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function useGetUsers(params: GetUsersParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData
  })
}
```

### Como usar:
1. Importe o hook no seu componente:
   ```typescript
   import { useGetUsers } from '@/hooks/useGetUsers'
   ```

2. Use-o para buscar dados:
   ```typescript
   const { data: users, isLoading, isError } = useGetUsers({ name: 'John' })
   ```

3. Exiba os dados:
   ```typescript
   if (isLoading) return <p>Carregando...</p>
   if (isError) return <p>Erro ao carregar usuários</p>

   return (
     <ul>
       {users.map(user => (
         <li key={user.id}>{user.name}</li>
       ))}
     </ul>
   )
   ```

---

## Atualizando Query Strings da URL

Manipular query strings é essencial para refletir o estado da aplicação na URL. Aqui está como fiz no componente `Home`:

```tsx
// filepath: /Users/pedrovinicius/Study/get-cookies-server-side/src/views/Home/index.tsx
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
              <p>Buscando usuários...</p>
            </div>
          ) : isError ? (
            <div className='border-2 border-red-500 rounded-md p-2 mt-2'>
              <p>Error ao buscar usuários</p>
            </div>
          ) : users?.length ? (
            users.map(user => (
              <div key={user.id} className='border-2 border-gray-300 rounded-md p-2 mt-2'>
                <p>{user.name}</p>
              </div>
            ))
          ) : (
            <div className='border-2 border-gray-300 rounded-md p-2 mt-2'>
              <p>Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
```

### Como funciona:
1. O campo de busca utiliza `useDebouncedCallback` para evitar chamadas excessivas à API enquanto o usuário digita.
2. A função `handleSearch` atualiza a query string da URL com o valor digitado.
3. A lista de usuários é exibida utilizando o hook `useGetUsers`.

---

## Dicas Finais

- **React Query**: Simplifica o gerenciamento de estado assíncrono e melhora a experiência do usuário com cache e revalidação automática.
- **Query Strings**: Úteis para refletir o estado da aplicação na URL, facilitando o compartilhamento e a navegação.
- **Actions**: Centralizam a lógica de chamadas à API, tornando o código mais organizado e reutilizável.

Espero que essas dicas ajudem você a melhorar seus projetos com **Next.js** e **React Query**!

Se você gostou, deixe um comentário ou compartilhe com alguém que pode se beneficiar. Vamos crescer juntos!

# Como Criar Hooks Customizados com React Query e Manipular Query Strings no Next.js

Este guia apresenta uma abordagem prática para quem trabalha com **React Query** e **Next.js**. Ele mostra como criar hooks customizados para gerenciar chamadas de API e como manipular query strings na URL de forma simples e eficiente.

---

## Instalação e Execução do Projeto

Siga os passos abaixo para configurar e rodar o projeto localmente:

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn** instalado

### Passo 1: Instale as dependências

Com **npm**:

```bash
npm install
```

Ou com **yarn**:

```bash
yarn install
```

### Passo 2: Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione a seguinte variável:

```
API_URL=https://jsonplaceholder.typicode.com/users
```

Essa URL será utilizada para realizar as chamadas de API no projeto.

### Passo 3: Execute o projeto

Com **npm**:

```bash
npm run dev
```

Ou com **yarn**:

```bash
yarn dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000).

---

## API Utilizada

Neste projeto, utilizamos a API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com) para simular chamadas de API. O endpoint configurado na variável de ambiente `API_URL` retorna uma lista de usuários fictícios com informações como `id`, `name`, `username` e `email`.

### Exemplo de Resposta

```json
[
  {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz"
  },
  {
    "id": 2,
    "name": "Ervin Howell",
    "username": "Antonette",
    "email": "Shanna@melissa.tv"
  }
  // ...outros usuários
]
```

Certifique-se de configurar corretamente a variável `API_URL` no arquivo `.env.local` para que as chamadas à API funcionem.

---

## Actions do Users

As actions são responsáveis por realizar as chamadas à API. Aqui está um exemplo:

```typescript
// filepath: /src/app/actions/users.ts
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

Os hooks customizados ajudam a centralizar a lógica de chamadas de API e o gerenciamento de estado. Aqui está um exemplo:

```typescript
// filepath: /src/hooks/useGetUsers.ts
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

Manipular query strings é essencial para refletir o estado da aplicação na URL. Aqui está um exemplo de como isso foi implementado no projeto:

### Componente `Search`

O componente `Search` foi separado para lidar exclusivamente com a lógica de busca e atualização da query string:

```tsx
// filepath: /src/views/Home/components/search.tsx
'use client'

import { useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const Search = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const params = useMemo(() => {
    const search = searchParams.get('search')

    return {
      name: search || ''
    }
  }, [searchParams])

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
  )
}

export default Search
```

### Componente `Home`

O componente `Home` utiliza o hook `useGetUsers` para buscar os dados e exibi-los. Ele também utiliza o componente `Search` dentro de um `Suspense` para melhorar a experiência do usuário:

```tsx
// filepath: /src/views/Home/index.tsx
'use client'

import { Suspense } from 'react'
import { useGetUsers } from '@/hooks/useGetUsers'
import Search from './components/search'

const Home = () => {
  const { data: users, isLoading, isError } = useGetUsers({ name: '' })

  return (
    <div className='flex items-center justify-center h-screen'>
      <div>
        <Suspense fallback={<div>Carregando...</div>}>
          <Search />
        </Suspense>
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

---

## Dicas Finais

- **React Query**: Simplifica o gerenciamento de estado assíncrono e melhora a experiência do usuário com cache e revalidação automática.
- **Query Strings**: Úteis para refletir o estado da aplicação na URL, facilitando o compartilhamento e a navegação.
- **Componentização**: Separar a lógica em componentes menores, como o `Search`, torna o código mais organizado e reutilizável.

Essas práticas podem ajudar a melhorar seus projetos com **Next.js** e **React Query**!

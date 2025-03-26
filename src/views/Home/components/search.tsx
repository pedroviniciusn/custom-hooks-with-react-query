import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

const Search = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = searchParams.get('search')

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
        defaultValue={search || ''}
        onChange={e => handleSearch(e.target.value)}
      />
    </div>
  )
}

export default Search

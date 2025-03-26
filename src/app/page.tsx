import Home from '@/views/Home'

export default async function Page(props: {
  searchParams?: Promise<{
    search?: string
  }>
}) {
  const searchParams = await props.searchParams
  const search = searchParams?.search || ''

  return <Home search={search} />
}

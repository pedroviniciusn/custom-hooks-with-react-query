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

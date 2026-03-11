import { useAuth } from './useAuth'

export function useHousehold() {
  const { household, refreshHousehold } = useAuth()
  const isAdmin = household?.role === 'admin'
  const isMember = !!household
  return { household, isAdmin, isMember, refreshHousehold }
}

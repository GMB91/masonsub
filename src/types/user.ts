export type User = {
  id: string
  email: string
  name?: string
  role?: 'admin' | 'manager' | 'user' | 'contractor' | 'client'
}

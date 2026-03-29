export interface AuthUser {
  id: string
  email: string | null
  username: string
  plan: 'free' | 'paid'
  avatarUrl: string | null
}

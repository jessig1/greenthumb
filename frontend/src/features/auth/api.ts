import { useMutation } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/api/types'

export function useRegister() {
  return useMutation({
    mutationFn: (request: RegisterRequest) => api.post<AuthResponse>('/api/v1/auth/register', request),
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (request: LoginRequest) => api.post<AuthResponse>('/api/v1/auth/login', request),
  })
}

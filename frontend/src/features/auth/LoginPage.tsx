import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useLogin } from './api'
import { useAuth } from './AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { LoginRequest } from '@/api/types'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit } = useForm<LoginRequest>({ defaultValues: { email: '', password: '' } })
  const loginMutation = useLogin()

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        login(response.token, response.user)
        navigate('/dashboard', { replace: true })
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Your garden is waiting."
      description="Log in to check your spaces, update plantings, and get help with what to grow next."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="h-11 pl-10" {...register('email', { required: true })} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" className="h-11 pl-10" {...register('password', { required: true })} />
          </div>
        </div>
        <Button type="submit" size="lg" disabled={loginMutation.isPending} className="mt-2 w-full">
          {loginMutation.isPending ? 'Logging in...' : 'Log in'}
          {!loginMutation.isPending && <ArrowRight />}
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        New to GreenThumb?{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}

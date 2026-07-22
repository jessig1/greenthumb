import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useRegister } from './api'
import { useAuth } from './AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RegisterRequest } from '@/api/types'

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit } = useForm<RegisterRequest>({ defaultValues: { email: '', password: '', displayName: '' } })
  const registerMutation = useRegister()

  const onSubmit = (data: RegisterRequest) => {
    registerMutation.mutate(data, {
      onSuccess: (response) => {
        login(response.token, response.user)
        navigate('/dashboard', { replace: true })
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <AuthLayout
      eyebrow="Start growing"
      title="Create your garden home."
      description="Bring every garden, container, and plant into one calm, organized place."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="displayName">Your name</Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="displayName" autoComplete="name" placeholder="How should we greet you?" className="h-11 pl-10" {...register('displayName', { required: true })} />
          </div>
        </div>
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
            <Input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" className="h-11 pl-10" {...register('password', { required: true, minLength: 8 })} />
          </div>
          <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
        </div>
        <Button type="submit" size="lg" disabled={registerMutation.isPending} className="mt-2 w-full">
          {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          {!registerMutation.isPending && <ArrowRight />}
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  )
}

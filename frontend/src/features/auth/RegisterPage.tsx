import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Sprout } from 'lucide-react'
import { useRegister } from './api'
import { useAuth } from './AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RegisterRequest } from '@/api/types'

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit } = useForm<RegisterRequest>({
    defaultValues: { email: '', password: '', displayName: '' },
  })
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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="flex items-center gap-2.5 font-semibold">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sprout className="size-6" />
        </span>
        <span className="text-2xl tracking-tight">GreenThumb</span>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-lg">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">Name</Label>
              <Input id="displayName" {...register('displayName', { required: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email', { required: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { required: true, minLength: 8 })}
              />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
            <Button type="submit" disabled={registerMutation.isPending} className="mt-2">
              Create account
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

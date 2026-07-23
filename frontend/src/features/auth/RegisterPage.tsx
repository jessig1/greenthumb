import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useRegister } from './api'
import { useAuth } from './AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RegisterRequest } from '@/api/types'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Sprout, Mail, Lock, User, ArrowRight } from 'lucide-react'

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
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background px-4 py-8 overflow-hidden">
      {/* Background Decorative Blur Spheres */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Top Bar Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-3.5 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center">
            <Sprout className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-1.5 pt-2">
            Green<span className="text-emerald-600 dark:text-emerald-400">Thumb</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Start planning your dream garden with smart layout tools & plant guides.
          </p>
        </div>

        {/* Card */}
        <Card className="border-border/60 shadow-xl bg-card/90 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Create an account</CardTitle>
            <CardDescription>Join GreenThumb to organize your gardens & plantings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="displayName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    placeholder="Jane Gardener"
                    className="pl-9 bg-background/50"
                    {...register('displayName', { required: true })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="gardener@example.com"
                    className="pl-9 bg-background/50"
                    {...register('email', { required: true })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    className="pl-9 bg-background/50"
                    {...register('password', { required: true, minLength: 8 })}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Must be at least 8 characters long.</p>
              </div>

              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium shadow-md shadow-emerald-600/20 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {registerMutation.isPending ? (
                  <span>Creating account...</span>
                ) : (
                  <>
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

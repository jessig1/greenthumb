import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useLogin } from './api'
import { useAuth } from './AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { LoginRequest } from '@/api/types'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Sprout, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit, setValue } = useForm<LoginRequest>({ defaultValues: { email: '', password: '' } })
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

  const fillDemoAccount = () => {
    setValue('email', 'demo@greenthumb.app')
    setValue('password', 'password123')
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background px-4 py-8 overflow-hidden">
      {/* Background Decorative Blur Spheres */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Top Bar for Theme Switcher */}
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
            Your personal garden planner for outdoor plots, raised beds & houseplants.
          </p>
        </div>

        {/* Card */}
        <Card className="border-border/60 shadow-xl bg-card/90 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your email and password to access your gardens</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 bg-background/50"
                    {...register('password', { required: true })}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium shadow-md shadow-emerald-600/20 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loginMutation.isPending ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <span>Log in</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t flex flex-col gap-3 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1 font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Fill sample credentials for testing
              </button>

              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Sign up free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/utils/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormInput } from '@/components/common/FormInput'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const from = location.state?.from?.pathname || '/'

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const user = await login(data)

      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'student') {
        navigate('/student', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (error) {
      setError('root', {
        message: error.response?.data?.message || 'Login failed. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sat-light to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-sat-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue your SAT preparation journey
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                error={errors.email?.message}
                required
              />

              <div className="space-y-2">
                <FormInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  error={errors.password?.message}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'relative',
                    right: '12px',
                    top: '-32px',
                    float: 'right'
                  }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.root && (
                <div className="text-sm text-red-600 text-center">
                  {errors.root.message}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-sat-primary hover:text-blue-700 font-medium"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="sat"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-sat-primary hover:text-blue-700"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
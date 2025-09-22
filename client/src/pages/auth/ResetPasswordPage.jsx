import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/utils/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormInput } from '@/components/common/FormInput'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const password = watch('password')

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password', { replace: true })
    }
  }, [token, navigate])

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      await resetPassword(token, data.password)
      setResetSuccess(true)
    } catch (error) {
      setError('root', {
        message: error.response?.data?.message || 'Failed to reset password. The link may have expired.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sat-light to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Password reset successful</CardTitle>
              <CardDescription>
                Your password has been successfully reset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="sat" className="w-full" asChild>
                <Link to="/login">
                  Continue to sign in
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sat-light to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="sat" className="w-full" asChild>
                <Link to="/forgot-password">
                  Request new reset link
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sat-light to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-sat-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">New Password</CardTitle>
            <CardDescription className="text-center">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <FormInput
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase and number'
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

              <div className="relative">
                <FormInput
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match'
                  })}
                  error={errors.confirmPassword?.message}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'relative',
                    right: '12px',
                    top: '-32px',
                    float: 'right'
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="sat"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Resetting password...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
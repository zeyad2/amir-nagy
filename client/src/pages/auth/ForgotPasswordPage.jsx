import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/utils/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormInput } from '@/components/common/FormInput'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { forgotPassword } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues
  } = useForm({
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      await forgotPassword(data.email)
      setEmailSent(true)
    } catch (error) {
      setError('root', {
        message: error.response?.data?.message || 'Failed to send reset email. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    const email = getValues('email')
    if (email) {
      try {
        setIsLoading(true)
        await forgotPassword(email)
      } catch (error) {
        setError('root', {
          message: 'Failed to resend email. Please try again.'
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sat-light to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                We've sent a password reset link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  If you don't see the email in your inbox, please check your spam folder.
                  The link will expire in 1 hour.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Resending...
                    </>
                  ) : (
                    'Resend email'
                  )}
                </Button>

                <Button variant="sat" className="w-full" asChild>
                  <Link to="/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries! Enter your email address and we'll send you a reset link
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                label="Email Address"
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

              {errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                variant="sat"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-sat-primary hover:text-blue-700 font-medium flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
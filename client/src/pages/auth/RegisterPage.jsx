import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/utils/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormInput } from "@/components/common/FormInput";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Eye, EyeOff, User, Mail, Phone, Users } from "lucide-react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    control,
  } = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      parentFirstName: "",
      parentLastName: "",
      parentPhone: "",
      parentEmail: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      // Remove confirmPassword from data before sending
      const { confirmPassword, ...registerData } = data;

      const user = await registerUser(registerData);

      // Redirect to student dashboard after successful registration
      navigate("/student", { replace: true });
    } catch (error) {
      setError("root", {
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sat-light to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-sat-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Join SAT Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start your SAT preparation journey
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Fill in the information below to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Student Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="First Name"
                    placeholder="John"
                    {...register("firstName", {
                      required: "First name is required",
                      minLength: {
                        value: 2,
                        message: "First name must be at least 2 characters",
                      },
                    })}
                    error={errors.firstName?.message}
                    required
                  />
                  <FormInput
                    label="Middle Name"
                    placeholder="Michael"
                    {...register("middleName", {
                      required: "Middle name is required",
                      minLength: {
                        value: 2,
                        message: "Middle name must be at least 2 characters",
                      },
                    })}
                    error={errors.middleName?.message}
                    required
                  />
                  <FormInput
                    label="Last Name"
                    placeholder="Smith"
                    {...register("lastName", {
                      required: "Last name is required",
                      minLength: {
                        value: 2,
                        message: "Last name must be at least 2 characters",
                      },
                    })}
                    error={errors.lastName?.message}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormInput
                    label="Email"
                    type="email"
                    placeholder="john.smith@email.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                    error={errors.email?.message}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      rules={{
                        required: "Phone number is required",
                        validate: (value) =>
                          isValidPhoneNumber(value || "") ||
                          "Please enter a valid phone number",
                      }}
                      render={({ field: { onChange, value } }) => (
                        <PhoneInput
                          international
                          defaultCountry="EG"
                          value={value}
                          onChange={onChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sat-primary focus:border-transparent"
                        />
                      )}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="relative">
                    <FormInput
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message:
                            "Password must contain uppercase, lowercase and number",
                        },
                      })}
                      error={errors.password?.message}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "relative",
                        right: "12px",
                        top: "-32px",
                        float: "right",
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
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                      error={errors.confirmPassword?.message}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{
                        position: "relative",
                        right: "12px",
                        top: "-32px",
                        float: "right",
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Parent/Guardian Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Parent First Name"
                    placeholder="Jane"
                    {...register("parentFirstName", {
                      required: "Parent first name is required",
                    })}
                    error={errors.parentFirstName?.message}
                    required
                  />
                  <FormInput
                    label="Parent Last Name"
                    placeholder="Smith"
                    {...register("parentLastName", {
                      required: "Parent last name is required",
                    })}
                    error={errors.parentLastName?.message}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Phone (WhatsApp){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="parentPhone"
                      control={control}
                      rules={{
                        required:
                          "Parent phone number is required for WhatsApp updates",
                        validate: (value) =>
                          isValidPhoneNumber(value || "") ||
                          "Please enter a valid phone number",
                      }}
                      render={({ field: { onChange, value } }) => (
                        <PhoneInput
                          international
                          defaultCountry="EG"
                          value={value}
                          onChange={onChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sat-primary focus:border-transparent"
                        />
                      )}
                    />
                    {errors.parentPhone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.parentPhone.message}
                      </p>
                    )}
                  </div>
                  <FormInput
                    label="Parent Email"
                    type="email"
                    placeholder="jane.smith@email.com"
                    {...register("parentEmail", {
                      required: "Parent email is required for notifications",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                    error={errors.parentEmail?.message}
                    required
                  />
                </div>
              </div>

              {errors.root && (
                <div className="text-sm text-red-600 text-center">
                  {errors.root.message}
                </div>
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-sat-primary hover:text-blue-700"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

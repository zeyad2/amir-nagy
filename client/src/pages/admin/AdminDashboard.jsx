import { useAuth } from '@/utils/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage courses, students, and platform content
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome, Mr. {user?.firstName}</CardTitle>
          <CardDescription>Platform management and analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your admin dashboard will be available in Phase 4!</p>
        </CardContent>
      </Card>
    </div>
  )
}
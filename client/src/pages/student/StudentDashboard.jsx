import { useAuth } from '@/utils/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentDashboard() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Continue your SAT preparation journey
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Dashboard</CardTitle>
          <CardDescription>Your learning progress and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your personalized dashboard will be available in Phase 7!</p>
        </CardContent>
      </Card>
    </div>
  )
}
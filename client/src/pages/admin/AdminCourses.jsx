import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminCourses() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>Create and manage SAT courses</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Course management will be available in Phase 5!</p>
        </CardContent>
      </Card>
    </div>
  )
}
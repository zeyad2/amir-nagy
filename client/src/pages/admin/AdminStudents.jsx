import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminStudents() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>Manage student enrollments and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Student management will be available in Phase 4!</p>
        </CardContent>
      </Card>
    </div>
  )
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Browse available SAT courses</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will display all available courses. Coming soon in Phase 3!</p>
        </CardContent>
      </Card>
    </div>
  )
}
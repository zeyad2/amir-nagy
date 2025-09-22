import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CourseLearnPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Course Learning</CardTitle>
          <CardDescription>Learn with lessons, homework and tests</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Course learning interface will be available in Phase 7!</p>
        </CardContent>
      </Card>
    </div>
  )
}
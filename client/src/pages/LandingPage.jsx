import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Import all section components
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CoursesSection from "@/components/landing/CoursesSection";
import CommunitySection from "@/components/landing/CommunitySection";
import FAQSection from "@/components/landing/FAQSection";

const LandingPage = () => {
  // Fetch courses data (preserving existing functionality)
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["public-courses"],
    queryFn: () => axios.get("/api/courses").then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const courses = coursesData?.data?.courses || [];

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);



  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Courses Section - Pass fetched courses data */}
      <CoursesSection courses={courses} isLoading={isLoading}  />

      {/* Community Section */}
      <CommunitySection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
    
    </div>
  );
};

export default LandingPage;

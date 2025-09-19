import React from 'react';
import { Routes, Route } from 'react-router-dom';

const StudentDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>
      
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/courses" element={<MyCourses />} />
        <Route path="/performance" element={<Performance />} />
      </Routes>
    </div>
  );
};

const DashboardHome = () => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-3 gap-6">
      <div className="card card-body text-center">
        <h3 className="text-2xl font-bold text-blue-600 mb-2">3</h3>
        <p className="text-gray-600">Enrolled Courses</p>
      </div>
      <div className="card card-body text-center">
        <h3 className="text-2xl font-bold text-green-600 mb-2">85%</h3>
        <p className="text-gray-600">Average Score</p>
      </div>
      <div className="card card-body text-center">
        <h3 className="text-2xl font-bold text-purple-600 mb-2">12</h3>
        <p className="text-gray-600">Completed Tests</p>
      </div>
    </div>
    
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
      </div>
      <div className="card-body">
        <p className="text-gray-600">Student portal functionality coming soon...</p>
      </div>
    </div>
  </div>
);

const MyCourses = () => (
  <div className="card card-body">
    <h2 className="text-xl font-semibold mb-4">My Courses</h2>
    <p className="text-gray-600">Course management functionality coming soon...</p>
  </div>
);

const Performance = () => (
  <div className="card card-body">
    <h2 className="text-xl font-semibold mb-4">Performance Analytics</h2>
    <p className="text-gray-600">Performance tracking functionality coming soon...</p>
  </div>
);

export default StudentDashboard;
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/requests" element={<EnrollmentRequests />} />
        <Route path="/resources" element={<ResourceManagement />} />
      </Routes>
    </div>
  );
};

const AdminHome = () => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-4 gap-6">
      <div className="card card-body text-center">
        <h3 className="text-2xl font-bold text-blue-600 mb-2">245</h3>
        <p className="text-gray-600">Total Students</p>
      </div>
      <div className="card card-body text-center">
        <h3 className="text-2xl font-bold text-green-600 mb-2">12</h3>
        <p className="text-gray-600">Active Courses</p>
      </div>
      <div className="card card-body text-center">
        <h3 className="text-2xl font-bold text-yellow-600 mb-2">8</h3>
        <p className="text-gray-600">Pending Requests</p>
      </div>
      <div className="card card-body text-center">
        <h3 className="text-2xl font-bold text-purple-600 mb-2">156</h3>
        <p className="text-gray-600">Recent Submissions</p>
      </div>
    </div>
    
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
      </div>
      <div className="card-body">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn btn-primary">Create Course</button>
          <button className="btn btn-secondary">Add Lesson</button>
          <button className="btn btn-outline">Create Test</button>
          <button className="btn btn-outline">View Reports</button>
        </div>
      </div>
    </div>
  </div>
);

const CourseManagement = () => (
  <div className="card card-body">
    <h2 className="text-xl font-semibold mb-4">Course Management</h2>
    <p className="text-gray-600">Course management interface coming soon...</p>
  </div>
);

const StudentManagement = () => (
  <div className="card card-body">
    <h2 className="text-xl font-semibold mb-4">Student Management</h2>
    <p className="text-gray-600">Student management interface coming soon...</p>
  </div>
);

const EnrollmentRequests = () => (
  <div className="card card-body">
    <h2 className="text-xl font-semibold mb-4">Enrollment Requests</h2>
    <p className="text-gray-600">Enrollment request management coming soon...</p>
  </div>
);

const ResourceManagement = () => (
  <div className="card card-body">
    <h2 className="text-xl font-semibold mb-4">Resource Management</h2>
    <p className="text-gray-600">Resource management interface coming soon...</p>
  </div>
);

export default AdminDashboard;
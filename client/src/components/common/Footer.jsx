import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">SAT Learning Platform</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Comprehensive SAT preparation with Mr. Amir Nagy. 
              Achieve your target score with our proven teaching methods 
              and personalized learning approach.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#courses" className="text-gray-300 hover:text-white transition-colors">
                  Courses
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Email: amir.nagy@example.com</p>
              <p>Phone: +20 XXX XXX XXXX</p>
              <p className="mt-4">
                <span className="block font-medium">Office Hours:</span>
                <span className="block">Sunday - Thursday: 9:00 AM - 6:00 PM</span>
                <span className="block">Friday: 9:00 AM - 2:00 PM</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} SAT Learning Platform by Mr. Amir Nagy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
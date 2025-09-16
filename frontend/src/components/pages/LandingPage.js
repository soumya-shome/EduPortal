import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  UserGroupIcon,
  ChartBarIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import RegisterModal from '../modals/RegisterModal';

const LandingPage = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleOpenRegister = () => {
    setShowRegisterModal(true);
  };

  const handleCloseModals = () => {
    setShowRegisterModal(false);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    // Note: We don't have access to login modal from landing page, so we'll just close
  };

  const features = [
    {
      icon: AcademicCapIcon,
      title: 'Expert Instructors',
      description: 'Learn from qualified teachers and industry professionals with years of experience.'
    },
    {
      icon: BookOpenIcon,
      title: 'Comprehensive Courses',
      description: 'Access a wide range of courses covering various subjects and skill levels.'
    },
    {
      icon: UserGroupIcon,
      title: 'Interactive Learning',
      description: 'Engage with fellow students and instructors in a collaborative learning environment.'
    },
    {
      icon: ChartBarIcon,
      title: 'Progress Tracking',
      description: 'Monitor your learning progress with detailed analytics and achievement tracking.'
    }
  ];

  const stats = [
    { label: 'Active Students', value: '10,000+' },
    { label: 'Expert Teachers', value: '500+' },
    { label: 'Courses Available', value: '1,200+' },
    { label: 'Success Rate', value: '95%' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      content: 'EduPortal has transformed my learning experience. The quality of instruction and the supportive community made all the difference.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Professional',
      content: 'I was able to upskill and advance my career thanks to the comprehensive courses available on this platform.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Teacher',
      content: 'Teaching on EduPortal has been incredibly rewarding. The platform makes it easy to connect with students and deliver quality education.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Learn from the
              <span className="text-blue-600"> Best</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with expert teachers and institutions to advance your education. 
              Join thousands of students already learning on our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                Browse Courses
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center">
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EduPortal?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to succeed in your educational journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sign Up
              </h3>
              <p className="text-gray-600">
                Create your account and choose your role as a student or teacher
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Browse & Enroll
              </h3>
              <p className="text-gray-600">
                Explore our course catalog and enroll in courses that interest you
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Learning
              </h3>
              <p className="text-gray-600">
                Access course materials, interact with instructors, and track your progress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already advancing their education with EduPortal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleOpenRegister}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Get Started Today
            </button>
            <Link
              to="/courses"
              className="border border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default LandingPage;
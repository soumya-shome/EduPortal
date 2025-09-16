import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  BookOpenIcon,
  ChartBarIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import RegisterModal from '../modals/RegisterModal';

const AboutPage = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleOpenRegister = () => {
    setShowRegisterModal(true);
  };

  const handleCloseModals = () => {
    setShowRegisterModal(false);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    // Note: We don't have access to login modal from about page, so we'll just close
  };

  const values = [
    {
      icon: AcademicCapIcon,
      title: 'Excellence in Education',
      description: 'We are committed to providing the highest quality education through expert instructors and comprehensive course materials.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community First',
      description: 'Building a supportive learning community where students and teachers can connect, collaborate, and grow together.'
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation',
      description: 'Embracing cutting-edge technology and teaching methods to deliver engaging and effective learning experiences.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Trust & Security',
      description: 'Ensuring a safe, secure, and trustworthy platform for all our users with robust privacy and security measures.'
    }
  ];

  const stats = [
    { label: 'Students Taught', value: '50,000+' },
    { label: 'Expert Instructors', value: '1,200+' },
    { label: 'Courses Available', value: '3,500+' },
    { label: 'Countries Served', value: '150+' }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former Google engineer with 15+ years in education technology.',
      image: null
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      bio: 'AI researcher and former MIT professor specializing in learning systems.',
      image: null
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Education',
      bio: 'Curriculum expert with PhD in Educational Psychology from Stanford.',
      image: null
    },
    {
      name: 'David Kim',
      role: 'Head of Product',
      bio: 'Product strategist with experience at leading edtech companies.',
      image: null
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About EduPortal
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We're on a mission to democratize education by connecting learners with the world's best teachers 
              and institutions through innovative technology and personalized learning experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                EduPortal was founded with a simple yet powerful vision: to make quality education accessible 
                to everyone, everywhere. We believe that learning should be personalized, engaging, and 
                available at your own pace.
              </p>
              <p className="text-lg text-gray-700 mb-8">
                By connecting students with expert instructors and providing cutting-edge learning tools, 
                we're building a global community of lifelong learners who are empowered to achieve their goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-center"
                >
                  Explore Courses
                </Link>
                <button
                  onClick={handleOpenRegister}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 text-center"
                >
                  Join Our Community
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-blue-100 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment to excellence in education
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <value.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Our Story</h3>
              <p className="text-green-100 mb-4">
                EduPortal was born from a simple observation: traditional education systems often fail to 
                meet the diverse needs of modern learners. Our founders, having experienced these challenges 
                firsthand, set out to create a better way.
              </p>
              <p className="text-green-100">
                Today, we're proud to serve learners from over 150 countries, helping them achieve their 
                educational and career goals through our innovative platform.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Building the Future of Education</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-4 flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Personalized Learning</h4>
                    <p className="text-gray-600">Adaptive learning paths that adjust to each student's pace and learning style.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-4 flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Global Access</h4>
                    <p className="text-gray-600">Breaking down geographical barriers to bring world-class education to everyone.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-4 flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Community-Driven</h4>
                    <p className="text-gray-600">Fostering connections between learners and educators worldwide.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate educators, engineers, and innovators behind EduPortal
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <UserGroupIcon className="h-10 w-10 text-blue-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how we're making a difference in education worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <HeartIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Success</h3>
              <p className="text-gray-600">
                95% of our students report improved skills and career advancement after completing courses
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                <GlobeAltIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Reach</h3>
              <p className="text-gray-600">
                Serving learners in 150+ countries with courses in 25+ languages
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Continuous Growth</h3>
              <p className="text-gray-600">
                Adding 100+ new courses monthly and expanding our instructor network
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Mission?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're a student looking to learn or an educator ready to teach, 
            we'd love to have you as part of our community.
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
              Explore Courses
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

export default AboutPage;
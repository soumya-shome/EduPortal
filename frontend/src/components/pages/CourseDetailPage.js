import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  BookOpenIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockCourse = {
      id: parseInt(id),
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This comprehensive course will take you from beginner to intermediate level, covering modern web development practices and tools.',
      teacher_name: 'Dr. Sarah Johnson',
      teacher_bio: 'Dr. Sarah Johnson is a senior software engineer with over 10 years of experience in web development. She has worked at major tech companies and has taught thousands of students.',
      difficulty_level: 'beginner',
      duration_weeks: 8,
      fee: 299.99,
      thumbnail: null,
      enrolled_students_count: 45,
      max_students: 50,
      average_rating: 4.8,
      total_ratings: 120,
      syllabus: `Week 1: Introduction to Web Development
- Understanding the web
- HTML basics and structure
- CSS fundamentals

Week 2: HTML Deep Dive
- Semantic HTML
- Forms and inputs
- Accessibility basics

Week 3: CSS Styling
- Layout techniques
- Responsive design
- CSS Grid and Flexbox

Week 4: JavaScript Fundamentals
- Variables and data types
- Functions and scope
- DOM manipulation

Week 5: JavaScript Advanced
- Events and event handling
- Asynchronous JavaScript
- API integration

Week 6: Project Development
- Building a portfolio website
- Best practices
- Code organization

Week 7: Testing and Debugging
- Browser developer tools
- Testing strategies
- Performance optimization

Week 8: Deployment and Next Steps
- Hosting and deployment
- Version control with Git
- Career guidance`,
      prerequisites: 'No prior programming experience required. Basic computer skills and enthusiasm to learn are all you need!',
      schedule_info: 'Classes are held every Tuesday and Thursday from 7:00 PM to 9:00 PM EST. All sessions are recorded and available for review.',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    };

    setCourse(mockCourse);
    setLoading(false);
  }, [id]);

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key={fullStars} className="h-5 w-5 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={fullStars + i + 1} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  const handleEnroll = () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    setShowEnrollmentModal(true);
  };

  const confirmEnrollment = () => {
    // Handle enrollment logic here
    setEnrolled(true);
    setShowEnrollmentModal(false);
    // Show success message
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Link to="/courses" className="text-blue-600 hover:text-blue-700">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/courses" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                  {course.difficulty_level}
                </span>
                <div className="flex items-center">
                  {renderStars(course.average_rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {course.average_rating} ({course.total_ratings} reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                <span>Instructor: {course.teacher_name}</span>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">{course.description}</p>
            </div>

            {/* Course Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>Master HTML5 and CSS3 fundamentals</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>Build responsive web layouts</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>JavaScript programming basics</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>DOM manipulation and events</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>API integration and AJAX</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <span>Deploy your first website</span>
                </div>
              </div>
            </div>

            {/* Syllabus */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Syllabus</h2>
              <div className="whitespace-pre-line text-gray-700">{course.syllabus}</div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Prerequisites</h2>
              <p className="text-gray-700">{course.prerequisites}</p>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule</h2>
              <p className="text-gray-700">{course.schedule_info}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-8">
              {/* Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-6">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <AcademicCapIcon className="h-16 w-16 text-white" />
                )}
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ${course.fee}
              </div>

              {/* Course Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Duration
                  </div>
                  <span className="font-medium">{course.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    Students
                  </div>
                  <span className="font-medium">{course.enrolled_students_count}/{course.max_students}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Level
                  </div>
                  <span className="font-medium capitalize">{course.difficulty_level}</span>
                </div>
              </div>

              {/* Enrollment Button */}
              {enrolled ? (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
                  <CheckCircleIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">You're enrolled!</p>
                  <p className="text-sm">Access your course materials in your dashboard.</p>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Enroll Now
                </button>
              )}

              {/* Money Back Guarantee */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  30-day money-back guarantee
                </p>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Instructor</h3>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">{course.teacher_name}</h4>
                  <p className="text-sm text-gray-600">Senior Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">{course.teacher_bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Enrollment</h3>
            <p className="text-gray-600 mb-6">
              You are about to enroll in "{course.title}" for ${course.fee}. 
              This will give you access to all course materials and live sessions.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnrollment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockCourses = [
      {
        id: 1,
        title: 'Introduction to Web Development',
        description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
        teacher_name: 'Dr. Sarah Johnson',
        difficulty_level: 'beginner',
        duration_weeks: 8,
        fee: 299.99,
        thumbnail: null,
        enrolled_students_count: 45,
        max_students: 50,
        average_rating: 4.8,
        category: 'Technology'
      },
      {
        id: 2,
        title: 'Advanced Python Programming',
        description: 'Master advanced Python concepts including data structures, algorithms, and frameworks.',
        teacher_name: 'Prof. Michael Chen',
        difficulty_level: 'advanced',
        duration_weeks: 12,
        fee: 499.99,
        thumbnail: null,
        enrolled_students_count: 32,
        max_students: 40,
        average_rating: 4.9,
        category: 'Technology'
      },
      {
        id: 3,
        title: 'Digital Marketing Fundamentals',
        description: 'Learn the basics of digital marketing including SEO, social media, and content marketing.',
        teacher_name: 'Emily Rodriguez',
        difficulty_level: 'intermediate',
        duration_weeks: 6,
        fee: 199.99,
        thumbnail: null,
        enrolled_students_count: 28,
        max_students: 35,
        average_rating: 4.6,
        category: 'Business'
      },
      {
        id: 4,
        title: 'Creative Writing Workshop',
        description: 'Develop your creative writing skills through exercises, feedback, and peer review.',
        teacher_name: 'Dr. James Wilson',
        difficulty_level: 'beginner',
        duration_weeks: 10,
        fee: 249.99,
        thumbnail: null,
        enrolled_students_count: 22,
        max_students: 25,
        average_rating: 4.7,
        category: 'Arts'
      },
      {
        id: 5,
        title: 'Data Science with R',
        description: 'Learn data analysis, visualization, and statistical modeling using R programming.',
        teacher_name: 'Dr. Lisa Park',
        difficulty_level: 'intermediate',
        duration_weeks: 14,
        fee: 599.99,
        thumbnail: null,
        enrolled_students_count: 18,
        max_students: 30,
        average_rating: 4.9,
        category: 'Technology'
      },
      {
        id: 6,
        title: 'Financial Planning Basics',
        description: 'Understand personal finance, budgeting, investing, and retirement planning.',
        teacher_name: 'Robert Thompson',
        difficulty_level: 'beginner',
        duration_weeks: 8,
        fee: 179.99,
        thumbnail: null,
        enrolled_students_count: 35,
        max_students: 45,
        average_rating: 4.5,
        category: 'Finance'
      }
    ];

    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
    setLoading(false);
  }, []);

  // Filter courses based on search and filters
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(course => course.difficulty_level === selectedDifficulty);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedDifficulty, selectedCategory]);

  const categories = ['all', 'Technology', 'Business', 'Arts', 'Finance', 'Science', 'Language'];
  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

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
      stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key={fullStars} className="h-4 w-4 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={fullStars + i + 1} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Courses</h1>
          <p className="text-gray-600">Discover amazing courses taught by expert instructors</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="lg:w-48">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <FunnelIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                {/* Course Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <AcademicCapIcon className="h-16 w-16 text-white" />
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6">
                  {/* Category and Difficulty */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-blue-600 font-medium">{course.category}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                      {course.difficulty_level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Instructor */}
                  <div className="flex items-center mb-4">
                    <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{course.teacher_name}</span>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {course.duration_weeks} weeks
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {course.enrolled_students_count}/{course.max_students}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-2">
                      {renderStars(course.average_rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {course.average_rating} ({course.enrolled_students_count} students)
                    </span>
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      ${course.fee}
                    </div>
                    <Link
                      to={`/courses/${course.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
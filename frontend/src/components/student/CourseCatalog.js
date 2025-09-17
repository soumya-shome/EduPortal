import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { BookOpen, Users, Clock, DollarSign, Star, Plus, Eye, CheckCircle } from 'lucide-react';
import axios from '../../utils/api';

const CourseCatalog = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const queryClient = useQueryClient();

  // Fetch available courses
  const { data: courses, isLoading, error } = useQuery('available-courses', async () => {
    try {
      const response = await axios.get('/api/courses/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
      return [];
    }
  });

  // Fetch student's enrollments
  const { data: enrollments } = useQuery('my-enrollments', async () => {
    try {
      const response = await axios.get('/api/enrollments/my_enrollments/');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
  });

  // Enroll in course mutation
  const enrollMutation = useMutation(
    async (courseId) => {
      return axios.post(`/api/courses/${courseId}/enroll/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-enrollments');
        queryClient.invalidateQueries('available-courses');
        toast.success('Successfully enrolled in course!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to enroll in course');
      }
    }
  );

  const filteredCourses = Array.isArray(courses) ? courses.filter(course => {
    // Filter by difficulty
    if (selectedDifficulty !== 'all' && course.difficulty_level !== selectedDifficulty) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !course.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  }) : [];

  const isEnrolled = (courseId) => {
    return Array.isArray(enrollments) && enrollments.some(enrollment => 
      enrollment.course === courseId && enrollment.is_active
    );
  };

  const handleEnroll = (courseId) => {
    enrollMutation.mutate(courseId);
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load courses</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Course Catalog</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {course.thumbnail && (
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                  {course.difficulty_level}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolled_students_count || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>${course.fee}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(course)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  View Details
                </button>
                {!isEnrolled(course.id) ? (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrollMutation.isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    {enrollMutation.isLoading ? 'Enrolling...' : 'Enroll'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md opacity-50 cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Enrolled
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BookOpen className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or difficulty filter.</p>
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Course Details</h3>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Info */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Course Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Teacher:</span>
                      <span className="font-medium">{selectedCourse.teacher_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{selectedCourse.duration_weeks} weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Difficulty:</span>
                      <span className="font-medium capitalize">{selectedCourse.difficulty_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fee:</span>
                      <span className="font-medium">${selectedCourse.fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Students:</span>
                      <span className="font-medium">{selectedCourse.enrolled_students_count || 0} enrolled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              <div className="lg:col-span-2">
                <h4 className="font-semibold text-gray-900 mb-4">Description</h4>
                <p className="text-gray-700 mb-6">{selectedCourse.description}</p>

                {selectedCourse.syllabus && (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-4">Syllabus</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCourse.syllabus}</pre>
                    </div>
                  </>
                )}

                {selectedCourse.prerequisites && (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-4">Prerequisites</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-700">{selectedCourse.prerequisites}</p>
                    </div>
                  </>
                )}

                {selectedCourse.schedule_info && (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-4">Schedule</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{selectedCourse.schedule_info}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {!isEnrolled(selectedCourse.id) ? (
                <button
                  onClick={() => {
                    handleEnroll(selectedCourse.id);
                    setSelectedCourse(null);
                  }}
                  disabled={enrollMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {enrollMutation.isLoading ? 'Enrolling...' : 'Enroll in Course'}
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-green-600 text-white rounded-md opacity-50 cursor-not-allowed"
                >
                  Already Enrolled
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog; 
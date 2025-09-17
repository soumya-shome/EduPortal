import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  BookOpen, Clock, Users, TrendingUp, Calendar, 
  Plus, Edit, Trash, Eye, CheckCircle, XCircle 
} from 'lucide-react';
import axios from '../../utils/api';
import toast from 'react-hot-toast';

const MyCourses = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner',
    duration_weeks: 8,
    fee: '',
    syllabus: '',
    prerequisites: '',
    max_students: 50,
    schedule_info: '',
    is_active: true
  });

  // Fetch teacher's courses
  const { data: courses, isLoading, error, refetch } = useQuery('my-courses', async () => {
    try {
      const response = await axios.get('/api/courses/my_courses/');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch your courses');
      throw error;
    }
  });

  // Fetch students for selected course
  const { data: students } = useQuery(
    ['course-students', selectedCourse],
    async () => {
      if (!selectedCourse) return [];
      try {
        const response = await axios.get(`/api/courses/${selectedCourse}/students/`);
        return response.data;
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to fetch students');
        return [];
      }
    },
    { enabled: !!selectedCourse }
  );

  // Fetch progress summary for selected course
  const { data: progressSummary } = useQuery(
    ['course-progress', selectedCourse],
    async () => {
      if (!selectedCourse) return null;
      try {
        const response = await axios.get(`/api/courses/${selectedCourse}/progress_summary/`);
        return response.data;
      } catch (error) {
        console.error('Error fetching progress summary:', error);
        toast.error('Failed to fetch progress summary');
        return null;
      }
    },
    { enabled: !!selectedCourse }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        ...formData,
        fee: parseFloat(formData.fee) || 0,
        duration_weeks: parseInt(formData.duration_weeks) || 8,
        max_students: parseInt(formData.max_students) || 50
      };

      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse.id}/`, courseData);
        toast.success('Course updated successfully!');
      } else {
        await axios.post('/api/courses/', courseData);
        toast.success('Course created successfully!');
      }
      setShowModal(false);
      setEditingCourse(null);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving course:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'Failed to save course';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      difficulty_level: course.difficulty_level,
      duration_weeks: course.duration_weeks,
      fee: course.fee.toString(),
      syllabus: course.syllabus || '',
      prerequisites: course.prerequisites || '',
      max_students: course.max_students,
      schedule_info: course.schedule_info || '',
      is_active: course.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/api/courses/${courseId}/`);
        toast.success('Course deleted successfully!');
        refetch();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty_level: 'beginner',
      duration_weeks: 8,
      fee: '',
      syllabus: '',
      prerequisites: '',
      max_students: 50,
      schedule_info: '',
      is_active: true
    });
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    resetForm();
    setShowModal(true);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
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
          <p className="text-red-600 mb-2">Failed to load your courses</p>
          <button 
            onClick={() => refetch()} 
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
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Course
        </button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(course)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                    title="Edit Course"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                    title="Delete Course"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolled_students_count || 0} students</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>${course.fee}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                  {course.difficulty_level}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {course.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {selectedCourse === course.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>
            </div>

            {/* Course Details */}
            {selectedCourse === course.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Students */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Enrolled Students</h4>
                    <div className="space-y-2">
                      {students?.length > 0 ? (
                        students.map((enrollment) => (
                          <div key={enrollment.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <span className="text-sm font-medium text-gray-700">{enrollment.student_name}</span>
                              <div className="text-xs text-gray-500">
                                Progress: {enrollment.completion_percentage}%
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              enrollment.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {enrollment.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No students enrolled</p>
                      )}
                    </div>
                  </div>

                  {/* Progress Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Progress Summary</h4>
                    {progressSummary ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Students</span>
                            <span className="text-sm font-medium">{progressSummary.total_students}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="text-sm font-medium">{progressSummary.completed_students}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg Completion</span>
                            <span className="text-sm font-medium">{progressSummary.avg_completion_percentage}%</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Completion Rate</span>
                            <span className="text-sm font-medium">{progressSummary.completion_rate}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No progress data available</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {(!courses || courses.length === 0) && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses created</h3>
          <p className="text-gray-600">You haven't created any courses yet.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Create Your First Course
          </button>
        </div>
      )}

      {/* Create/Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (weeks)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData({...formData, duration_weeks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fee}
                    onChange={(e) => setFormData({...formData, fee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Students
                  </label>
                  <input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData({...formData, max_students: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Syllabus
                </label>
                <textarea
                  value={formData.syllabus}
                  onChange={(e) => setFormData({...formData, syllabus: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter course syllabus..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prerequisites
                </label>
                <textarea
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter course prerequisites..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Information
                </label>
                <textarea
                  value={formData.schedule_info}
                  onChange={(e) => setFormData({...formData, schedule_info: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter schedule information..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active Course
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses; 
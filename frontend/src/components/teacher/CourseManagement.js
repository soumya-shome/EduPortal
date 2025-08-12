import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { Edit, Users, BookOpen, Calendar, TrendingUp, Plus } from 'lucide-react';
import axios from 'axios';

const CourseManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [editingWeekly, setEditingWeekly] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner',
    duration_weeks: 8,
    fee: '',
    max_students: 50,
    syllabus: '',
    prerequisites: '',
    is_active: true
  });
  const [weeklyFormData, setWeeklyFormData] = useState({
    week_number: '',
    title: '',
    description: '',
    topics_covered: '',
    assignments: ''
  });

  const queryClient = useQueryClient();

  // Fetch teacher's courses
  const { data: courses, isLoading } = useQuery('my-courses', async () => {
    const response = await axios.get('/api/courses/my_courses/');
    return response.data;
  });

  // Fetch weekly details for selected course
  const { data: weeklyDetails } = useQuery(
    ['weekly-details', selectedCourse],
    async () => {
      if (!selectedCourse) return [];
      const response = await axios.get(`/api/weekly-details/?course=${selectedCourse}`);
      return response.data;
    },
    { enabled: !!selectedCourse }
  );

  // Update course mutation
  const courseMutation = useMutation(
    async (data) => {
      return axios.put(`/api/courses/${editingCourse.id}/`, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-courses');
        toast.success('Course updated successfully!');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    }
  );

  // Create/Update weekly detail mutation
  const weeklyMutation = useMutation(
    async (data) => {
      if (editingWeekly) {
        return axios.put(`/api/weekly-details/${editingWeekly.id}/`, data);
      } else {
        return axios.post('/api/weekly-details/', data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['weekly-details', selectedCourse]);
        toast.success(editingWeekly ? 'Weekly detail updated successfully!' : 'Weekly detail created successfully!');
        handleCloseWeeklyModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    courseMutation.mutate(formData);
  };

  const handleWeeklySubmit = (e) => {
    e.preventDefault();
    weeklyMutation.mutate({
      ...weeklyFormData,
      course: selectedCourse
    });
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      difficulty_level: course.difficulty_level,
      duration_weeks: course.duration_weeks,
      fee: course.fee,
      max_students: course.max_students,
      syllabus: course.syllabus || '',
      prerequisites: course.prerequisites || '',
      is_active: course.is_active
    });
    setIsModalOpen(true);
  };

  const handleEditWeekly = (weekly) => {
    setEditingWeekly(weekly);
    setWeeklyFormData({
      week_number: weekly.week_number,
      title: weekly.title,
      description: weekly.description,
      topics_covered: weekly.topics_covered,
      assignments: weekly.assignments || ''
    });
    setIsWeeklyModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      difficulty_level: 'beginner',
      duration_weeks: 8,
      fee: '',
      max_students: 50,
      syllabus: '',
      prerequisites: '',
      is_active: true
    });
  };

  const handleCloseWeeklyModal = () => {
    setIsWeeklyModalOpen(false);
    setEditingWeekly(null);
    setWeeklyFormData({
      week_number: '',
      title: '',
      description: '',
      topics_covered: '',
      assignments: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWeeklyInputChange = (e) => {
    const { name, value } = e.target;
    setWeeklyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-600 capitalize">{course.difficulty_level}</p>
              </div>
              <button
                onClick={() => handleEdit(course)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit size={16} />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{course.duration_weeks} weeks</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fee:</span>
                <span className="font-medium">${course.fee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Students:</span>
                <span className="font-medium">{course.enrolled_students_count}/{course.max_students}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <BookOpen size={14} />
                <span>{course.average_rating ? `${course.average_rating.toFixed(1)}★` : 'No ratings'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{new Date(course.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                course.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {course.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSelectedCourse(course.id)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Manage Weekly Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Details Section */}
      {selectedCourse && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Weekly Details - {courses?.find(c => c.id === selectedCourse)?.title}
            </h3>
            <button
              onClick={() => setIsWeeklyModalOpen(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Weekly Detail
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyDetails?.map((weekly) => (
                <div key={weekly.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">Week {weekly.week_number}</h4>
                      <p className="text-sm font-medium text-gray-700">{weekly.title}</p>
                    </div>
                    <button
                      onClick={() => handleEditWeekly(weekly)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{weekly.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Topics:</span>
                      <p className="text-xs text-gray-700 line-clamp-2">{weekly.topics_covered}</p>
                    </div>
                    {weekly.assignments && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Assignments:</span>
                        <p className="text-xs text-gray-700 line-clamp-2">{weekly.assignments}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {weeklyDetails?.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No weekly details</h3>
                <p className="text-gray-500">Add weekly details to organize your course content.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Course</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    name="duration_weeks"
                    value={formData.duration_weeks}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee ($)
                  </label>
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
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
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Syllabus
                </label>
                <textarea
                  name="syllabus"
                  value={formData.syllabus}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Course syllabus and learning objectives..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prerequisites
                </label>
                <textarea
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Required knowledge or skills..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active Course
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {courseMutation.isLoading ? 'Saving...' : 'Update Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Detail Modal */}
      {isWeeklyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingWeekly ? 'Edit Weekly Detail' : 'Add Weekly Detail'}
              </h3>
              <button
                onClick={handleCloseWeeklyModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWeeklySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Week Number *
                  </label>
                  <input
                    type="number"
                    name="week_number"
                    value={weeklyFormData.week_number}
                    onChange={handleWeeklyInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={weeklyFormData.title}
                    onChange={handleWeeklyInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={weeklyFormData.description}
                  onChange={handleWeeklyInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topics Covered *
                </label>
                <textarea
                  name="topics_covered"
                  value={weeklyFormData.topics_covered}
                  onChange={handleWeeklyInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List the topics that will be covered this week..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignments
                </label>
                <textarea
                  name="assignments"
                  value={weeklyFormData.assignments}
                  onChange={handleWeeklyInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe any assignments or homework for this week..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseWeeklyModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={weeklyMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {weeklyMutation.isLoading ? 'Saving...' : (editingWeekly ? 'Update Weekly Detail' : 'Add Weekly Detail')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement; 
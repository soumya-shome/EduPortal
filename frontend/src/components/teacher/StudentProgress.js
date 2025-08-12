import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { User, TrendingUp, BookOpen, Calendar, Edit, Eye } from 'lucide-react';
import axios from 'axios';

const StudentProgress = () => {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgress, setEditingProgress] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    week_number: '',
    attendance_percentage: 0,
    assignment_score: '',
    quiz_score: '',
    participation_score: '',
    teacher_notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch teacher's courses
  const { data: courses } = useQuery('my-courses', async () => {
    const response = await axios.get('/api/courses/my_courses/');
    return response.data;
  });

  // Fetch student progress
  const { data: progressRecords, isLoading } = useQuery(
    ['student-progress', selectedCourse],
    async () => {
      const response = await axios.get('/api/student-progress/');
      return response.data;
    }
  );

  // Fetch students for selected course
  const { data: courseStudents } = useQuery(
    ['course-students', selectedCourse],
    async () => {
      if (!selectedCourse || selectedCourse === 'all') return [];
      const response = await axios.get(`/api/courses/${selectedCourse}/students/`);
      return response.data;
    },
    { enabled: !!selectedCourse && selectedCourse !== 'all' }
  );

  // Create/Update progress mutation
  const progressMutation = useMutation(
    async (data) => {
      if (editingProgress) {
        return axios.put(`/api/student-progress/${editingProgress.id}/`, data);
      } else {
        return axios.post('/api/student-progress/', data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['student-progress', selectedCourse]);
        toast.success(editingProgress ? 'Progress updated successfully!' : 'Progress recorded successfully!');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    }
  );

  const filteredProgress = progressRecords?.filter(progress => {
    if (selectedCourse === 'all') return true;
    return progress.course === parseInt(selectedCourse);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    progressMutation.mutate(formData);
  };

  const handleEdit = (progress) => {
    setEditingProgress(progress);
    setFormData({
      student: progress.student,
      course: progress.course,
      week_number: progress.week_number,
      attendance_percentage: progress.attendance_percentage,
      assignment_score: progress.assignment_score || '',
      quiz_score: progress.quiz_score || '',
      participation_score: progress.participation_score || '',
      teacher_notes: progress.teacher_notes || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProgress(null);
    setFormData({
      student: '',
      course: '',
      week_number: '',
      attendance_percentage: 0,
      assignment_score: '',
      quiz_score: '',
      participation_score: '',
      teacher_notes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate statistics
  const totalStudents = courseStudents?.length || 0;
  const averageAttendance = progressRecords?.reduce((sum, p) => sum + p.attendance_percentage, 0) / (progressRecords?.length || 1) || 0;
  const averageOverallScore = progressRecords?.reduce((sum, p) => sum + p.overall_score, 0) / (progressRecords?.length || 1) || 0;
  const totalWeeks = progressRecords?.reduce((max, p) => Math.max(max, p.week_number), 0) || 0;

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
        <h2 className="text-2xl font-bold text-gray-900">Student Progress</h2>
        <div className="flex gap-2">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Courses</option>
            {courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} />
            Record Progress
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{averageAttendance.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Overall Score</p>
              <p className="text-2xl font-bold text-gray-900">{averageOverallScore.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Weeks</p>
              <p className="text-2xl font-bold text-gray-900">{totalWeeks}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Progress Records</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProgress?.map((progress) => (
                <tr key={progress.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {progress.student_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {progress.course_title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Week {progress.week_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressBarColor(progress.attendance_percentage)}`}
                          style={{ width: `${progress.attendance_percentage}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getProgressColor(progress.attendance_percentage)}`}>
                        {progress.attendance_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {progress.assignment_score !== null ? `${progress.assignment_score}%` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {progress.quiz_score !== null ? `${progress.quiz_score}%` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {progress.participation_score !== null ? `${progress.participation_score}%` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressBarColor(progress.overall_score)}`}
                          style={{ width: `${progress.overall_score}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getProgressColor(progress.overall_score)}`}>
                        {progress.overall_score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(progress)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProgress?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <TrendingUp className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No progress records found</h3>
            <p className="text-gray-500">No progress records match the current filter.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingProgress ? 'Edit Progress' : 'Record Progress'}
              </h3>
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
                    Student *
                  </label>
                  <select
                    name="student"
                    value={formData.student}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Student</option>
                    {courseStudents?.map((enrollment) => (
                      <option key={enrollment.student} value={enrollment.student}>
                        {enrollment.student_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course *
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses?.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Week Number *
                  </label>
                  <input
                    type="number"
                    name="week_number"
                    value={formData.week_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendance Percentage *
                  </label>
                  <input
                    type="number"
                    name="attendance_percentage"
                    value={formData.attendance_percentage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Score (%)
                  </label>
                  <input
                    type="number"
                    name="assignment_score"
                    value={formData.assignment_score}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Score (%)
                  </label>
                  <input
                    type="number"
                    name="quiz_score"
                    value={formData.quiz_score}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participation Score (%)
                  </label>
                  <input
                    type="number"
                    name="participation_score"
                    value={formData.participation_score}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher Notes
                </label>
                <textarea
                  name="teacher_notes"
                  value={formData.teacher_notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about the student's progress..."
                />
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
                  disabled={progressMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {progressMutation.isLoading ? 'Saving...' : (editingProgress ? 'Update Progress' : 'Record Progress')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgress; 
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { FileText, Plus, Search, Calendar, Clock, Users, Edit, Trash2, Eye, Play, BookOpen } from 'lucide-react';
import axios from '../../utils/api';

const Exams = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    course: '',
    duration: 60,
    total_marks: 100,
    start_date: '',
    end_date: ''
  });

  const queryClient = useQueryClient();

  // Fetch teacher's exams
  const { data: exams, isLoading } = useQuery('teacher-exams', async () => {
    try {
      const response = await axios.get('/api/exams/teacher-exams/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams');
      return [];
    }
  });

  // Fetch teacher's courses
  const { data: teacherCourses } = useQuery('teacher-courses', async () => {
    try {
      const response = await axios.get('/api/courses/teacher-courses/');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      return [];
    }
  });

  // Create exam mutation
  const createExamMutation = useMutation(
    async (examData) => {
      return axios.post('/api/exams/', examData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacher-exams');
        toast.success('Exam created successfully!');
        setShowCreateModal(false);
        setExamForm({
          title: '',
          description: '',
          course: '',
          duration: 60,
          total_marks: 100,
          start_date: '',
          end_date: ''
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create exam');
      }
    }
  );

  // Delete exam mutation
  const deleteExamMutation = useMutation(
    async (examId) => {
      return axios.delete(`/api/exams/${examId}/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacher-exams');
        toast.success('Exam deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete exam');
      }
    }
  );

  const filteredExams = exams?.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || exam.course === parseInt(selectedCourse);
    
    return matchesSearch && matchesCourse;
  }) || [];

  const handleCreateExam = async (e) => {
    e.preventDefault();
    createExamMutation.mutate(examForm);
  };

  const handleDeleteExam = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      deleteExamMutation.mutate(examId);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startDate = new Date(exam.start_date);
    const endDate = new Date(exam.end_date);
    
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    return 'completed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white shadow rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Exams</h1>
          <p className="text-gray-600">Create and manage exams for your courses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Exam</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Courses</option>
            {teacherCourses?.map(course => (
              <option key={course.id} value={course.id}>
                {course.course_name}
              </option>
            ))}
          </select>
          
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-500">
              {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        {filteredExams.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-500">Start by creating your first exam.</p>
          </div>
        ) : (
          filteredExams.map((exam) => {
            const status = getExamStatus(exam);
            return (
              <div key={exam.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-primary-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {exam.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{exam.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{exam.course_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{exam.duration} minutes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(exam.start_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedExam(exam)}
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Exam</h3>
              <form onSubmit={handleCreateExam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={examForm.title}
                    onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={examForm.description}
                    onChange={(e) => setExamForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <select
                    value={examForm.course}
                    onChange={(e) => setExamForm(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a course</option>
                    {teacherCourses?.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={examForm.duration}
                      onChange={(e) => setExamForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={examForm.total_marks}
                      onChange={(e) => setExamForm(prev => ({ ...prev, total_marks: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={examForm.start_date}
                      onChange={(e) => setExamForm(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={examForm.end_date}
                      onChange={(e) => setExamForm(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createExamMutation.isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {createExamMutation.isLoading ? 'Creating...' : 'Create Exam'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Exam Detail Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Exam Details
                </h3>
                <button
                  onClick={() => setSelectedExam(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedExam.title}</h4>
                  <p className="text-gray-600">{selectedExam.description}</p>
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Course:</span>
                    <span className="text-sm font-medium">{selectedExam.course_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <span className="text-sm font-medium">{selectedExam.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Marks:</span>
                    <span className="text-sm font-medium">{selectedExam.total_marks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Start Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(selectedExam.start_date).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">End Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(selectedExam.end_date).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams; 
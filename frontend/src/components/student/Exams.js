import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, BookOpen, Play, CheckCircle, AlertCircle } from 'lucide-react';
import axios from '../../utils/api';

const Exams = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [isTakingExam, setIsTakingExam] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examAttempt, setExamAttempt] = useState(null);

  const queryClient = useQueryClient();

  // Fetch available exams
  const { data: exams, isLoading, error } = useQuery('available-exams', async () => {
    try {
      const response = await axios.get('/api/exams/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams');
      return [];
    }
  });

  // Fetch exam details
  const { data: examDetails } = useQuery(
    ['exam-details', selectedExam],
    async () => {
      if (!selectedExam) return null;
      try {
        const response = await axios.get(`/api/exams/${selectedExam}/detail/`);
        return response.data;
      } catch (error) {
        console.error('Error fetching exam details:', error);
        toast.error('Failed to fetch exam details');
        return null;
      }
    },
    { enabled: !!selectedExam }
  );

  // Start exam mutation
  const startExamMutation = useMutation(
    async (examId) => {
      return axios.post(`/api/exams/${examId}/start_exam/`);
    },
    {
      onSuccess: (data) => {
        setExamAttempt(data.data);
        setIsTakingExam(true);
        setCurrentQuestion(0);
        setAnswers({});
        toast.success('Exam started successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to start exam');
      }
    }
  );

  // Submit exam mutation
  const submitExamMutation = useMutation(
    async (data) => {
      return axios.post(`/api/exams/${selectedExam}/submit_exam/`, data);
    },
    {
      onSuccess: () => {
        setIsTakingExam(false);
        setSelectedExam(null);
        setExamAttempt(null);
        queryClient.invalidateQueries('available-exams');
        toast.success('Exam submitted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit exam');
      }
    }
  );

  const handleStartExam = (examId) => {
    startExamMutation.mutate(examId);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitExam = () => {
    const answersData = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: parseInt(questionId),
      selected_option_id: answer.selected_option_id,
      text_answer: answer.text_answer
    }));

    submitExamMutation.mutate({ answers: answersData });
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'ended';
    if (exam.is_ongoing) return 'ongoing';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return <Calendar className="h-4 w-4" />;
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'ongoing':
        return <AlertCircle className="h-4 w-4" />;
      case 'ended':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
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
          <p className="text-red-600 mb-2">Failed to load exams</p>
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
        <h2 className="text-2xl font-bold text-gray-900">Exams</h2>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(exams) && exams.map((exam) => {
          const status = getExamStatus(exam);
          return (
            <div key={exam.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{exam.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{exam.course_title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(exam.start_time).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{exam.duration_minutes} minutes</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedExam(exam.id)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    View Details
                  </button>
                  {status === 'active' && (
                    <button
                      onClick={() => handleStartExam(exam.id)}
                      disabled={startExamMutation.isLoading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {startExamMutation.isLoading ? 'Starting...' : 'Start Exam'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(!Array.isArray(exams) || exams.length === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BookOpen className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exams available</h3>
          <p className="text-gray-500">There are no exams scheduled at the moment.</p>
        </div>
      )}

      {/* Exam Details Modal */}
      {selectedExam && examDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Exam Details</h3>
              <button
                onClick={() => setSelectedExam(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{examDetails.title}</h4>
                <p className="text-gray-600">{examDetails.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Exam Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Course:</span>
                      <span className="font-medium">{examDetails.course_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{examDetails.duration_minutes} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Questions:</span>
                      <span className="font-medium">{examDetails.questions_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start Time:</span>
                      <span className="font-medium">{new Date(examDetails.start_time).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">End Time:</span>
                      <span className="font-medium">{new Date(examDetails.end_time).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Instructions</h5>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Read each question carefully before answering</p>
                    <p>• You cannot go back to previous questions</p>
                    <p>• Ensure you have a stable internet connection</p>
                    <p>• Submit your exam before the time limit</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedExam(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                {getExamStatus(examDetails) === 'active' && (
                  <button
                    onClick={() => {
                      handleStartExam(examDetails.id);
                      setSelectedExam(null);
                    }}
                    disabled={startExamMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {startExamMutation.isLoading ? 'Starting...' : 'Start Exam'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Taking Exam Modal */}
      {isTakingExam && examDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Taking Exam: {examDetails.title}</h3>
              <div className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {examDetails.questions?.length || 0}
              </div>
            </div>

            {examDetails.questions && examDetails.questions[currentQuestion] && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Question {currentQuestion + 1}
                  </h4>
                  <p className="text-gray-700">{examDetails.questions[currentQuestion].text}</p>
                </div>

                <div className="space-y-3">
                  {examDetails.questions[currentQuestion].options?.map((option) => (
                    <label key={option.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${examDetails.questions[currentQuestion].id}`}
                        value={option.id}
                        onChange={() => handleAnswerChange(examDetails.questions[currentQuestion].id, { selected_option_id: option.id })}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{option.text}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {currentQuestion < (examDetails.questions?.length || 0) - 1 ? (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitExam}
                      disabled={submitExamMutation.isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {submitExamMutation.isLoading ? 'Submitting...' : 'Submit Exam'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams; 
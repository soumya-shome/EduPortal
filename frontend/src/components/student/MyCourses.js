import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { BookOpen, Clock, TrendingUp, Calendar, Eye, Download, Play } from 'lucide-react';
import axios from '../../utils/api';
import toast from 'react-hot-toast';

const MyCourses = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Fetch student's enrollments
  const { data: enrollments, isLoading, error } = useQuery('my-enrollments', async () => {
    try {
      const response = await axios.get('/api/enrollments/my_enrollments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to fetch your courses');
      throw error;
    }
  });

  // Fetch study materials for selected course
  const { data: studyMaterials } = useQuery(
    ['study-materials', selectedCourse],
    async () => {
      if (!selectedCourse) return [];
      try {
        const response = await axios.get(`/api/study-materials/?course=${selectedCourse}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching study materials:', error);
        toast.error('Failed to fetch study materials');
        return [];
      }
    },
    { enabled: !!selectedCourse }
  );

  // Fetch weekly details for selected course
  const { data: weeklyDetails } = useQuery(
    ['weekly-details', selectedCourse],
    async () => {
      if (!selectedCourse) return [];
      try {
        const response = await axios.get(`/api/weekly-details/?course=${selectedCourse}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching weekly details:', error);
        toast.error('Failed to fetch course schedule');
        return [];
      }
    },
    { enabled: !!selectedCourse }
  );

  // Fetch student progress for selected course
  const { data: progressRecords } = useQuery(
    ['student-progress', selectedCourse],
    async () => {
      if (!selectedCourse) return [];
      try {
        const response = await axios.get(`/api/student-progress/course_progress/?course_id=${selectedCourse}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching progress:', error);
        toast.error('Failed to fetch progress data');
        return [];
      }
    },
    { enabled: !!selectedCourse }
  );

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMaterialTypeIcon = (type) => {
    switch (type) {
      case 'document':
        return <Download className="h-4 w-4" />;
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'link':
        return <Eye className="h-4 w-4" />;
      case 'presentation':
        return <BookOpen className="h-4 w-4" />;
      case 'assignment':
        return <BookOpen className="h-4 w-4" />;
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
          <p className="text-red-600 mb-2">Failed to load your courses</p>
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

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled</h3>
          <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
        </div>
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
        {enrollments?.map((enrollment) => (
          <div key={enrollment.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {enrollment.course.thumbnail && (
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <img 
                  src={enrollment.course.thumbnail} 
                  alt={enrollment.course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {enrollment.course.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {enrollment.course.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className={`font-medium ${getProgressColor(enrollment.completion_percentage)}`}>
                    {enrollment.completion_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(enrollment.completion_percentage)}`}
                    style={{ width: `${enrollment.completion_percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{enrollment.course.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{enrollment.course.difficulty_level}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCourse(selectedCourse === enrollment.course.id ? null : enrollment.course.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {selectedCourse === enrollment.course.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>
            </div>

            {/* Course Details */}
            {selectedCourse === enrollment.course.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Study Materials */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Study Materials</h4>
                    <div className="space-y-2">
                      {studyMaterials?.length > 0 ? (
                        studyMaterials.map((material) => (
                          <div key={material.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                            {getMaterialTypeIcon(material.material_type)}
                            <span className="text-sm text-gray-700">{material.title}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No materials available</p>
                      )}
                    </div>
                  </div>

                  {/* Weekly Schedule */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Weekly Schedule</h4>
                    <div className="space-y-2">
                      {weeklyDetails?.length > 0 ? (
                        weeklyDetails.map((week) => (
                          <div key={week.id} className="p-2 bg-white rounded border">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Week {week.week_number}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{week.title}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No schedule available</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Records */}
                {progressRecords?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Progress Records</h4>
                    <div className="space-y-2">
                      {progressRecords.map((progress) => (
                        <div key={progress.id} className="p-3 bg-white rounded border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Week {progress.week_number}</span>
                            <span className="text-sm text-gray-600">{progress.overall_score}%</span>
                          </div>
                          <div className="mt-2 space-y-1 text-xs text-gray-600">
                            <div>Attendance: {progress.attendance_percentage}%</div>
                            {progress.assignment_score && <div>Assignment: {progress.assignment_score}%</div>}
                            {progress.quiz_score && <div>Quiz: {progress.quiz_score}%</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCourses; 
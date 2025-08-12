import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import { Users, Search, BookOpen, Calendar, Mail, Phone, GraduationCap, Eye } from 'lucide-react';
import axios from '../../utils/api';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch students enrolled in teacher's courses
  const { data: students, isLoading } = useQuery('teacher-students', async () => {
    try {
      const response = await axios.get('/api/students/teacher-students/');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
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

  const filteredStudents = students?.filter(student => {
    const matchesSearch = 
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || 
      student.enrolled_courses?.some(course => course.id === parseInt(selectedCourse));
    
    return matchesSearch && matchesCourse;
  }) || [];

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Students</h1>
        <p className="text-gray-600">View and manage students enrolled in your courses</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
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
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-white shadow rounded-lg p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">No students are enrolled in your courses yet.</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewStudent(student)}
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">View</span>
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{student.phone || 'No phone number'}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{student.enrolled_courses?.length || 0} course{student.enrolled_courses?.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(student.date_joined).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Student Details
                </h3>
                <button
                  onClick={closeStudentModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-xl">
                      {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </h4>
                    <p className="text-gray-500">{selectedStudent.email}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedStudent.phone || 'No phone number'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedStudent.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Joined {new Date(selectedStudent.date_joined).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Enrolled Courses</h5>
                  <div className="space-y-2">
                    {selectedStudent.enrolled_courses?.length > 0 ? (
                      selectedStudent.enrolled_courses.map((course) => (
                        <div key={course.id} className="flex items-center space-x-2 text-sm">
                          <BookOpen className="h-4 w-4 text-primary-500" />
                          <span className="text-gray-600">{course.course_name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No courses enrolled</p>
                    )}
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

export default Students; 
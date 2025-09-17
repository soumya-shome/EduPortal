import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  StarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  MapPinIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const InstitutionsPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockTeachers = [
      {
        id: 1,
        username: 'sarah_johnson',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@eduportal.com',
        bio: 'Dr. Sarah Johnson is a senior software engineer with over 10 years of experience in web development. She has worked at major tech companies including Google and Microsoft, and has taught thousands of students worldwide.',
        subjects: ['Web Development', 'JavaScript', 'React'],
        experience_years: 10,
        rating: 4.9,
        total_students: 2500,
        courses_count: 8,
        profile_picture: null,
        location: 'San Francisco, CA',
        education: 'PhD in Computer Science, Stanford University',
        specializations: ['Frontend Development', 'Full Stack Development', 'UI/UX Design']
      },
      {
        id: 2,
        username: 'michael_chen',
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@eduportal.com',
        bio: 'Prof. Michael Chen is a data scientist and machine learning expert with extensive experience in Python programming and AI. He has published numerous research papers and has industry experience at leading tech companies.',
        subjects: ['Python', 'Data Science', 'Machine Learning'],
        experience_years: 8,
        rating: 4.8,
        total_students: 1800,
        courses_count: 6,
        profile_picture: null,
        location: 'New York, NY',
        education: 'MS in Data Science, MIT',
        specializations: ['Machine Learning', 'Deep Learning', 'Data Analysis']
      },
      {
        id: 3,
        username: 'emily_rodriguez',
        first_name: 'Emily',
        last_name: 'Rodriguez',
        email: 'emily.rodriguez@eduportal.com',
        bio: 'Emily Rodriguez is a digital marketing strategist with over 7 years of experience helping businesses grow their online presence. She has worked with startups and Fortune 500 companies.',
        subjects: ['Digital Marketing', 'SEO', 'Social Media'],
        experience_years: 7,
        rating: 4.7,
        total_students: 1200,
        courses_count: 5,
        profile_picture: null,
        location: 'Los Angeles, CA',
        education: 'MBA in Marketing, UCLA',
        specializations: ['Content Marketing', 'Social Media Strategy', 'Analytics']
      },
      {
        id: 4,
        username: 'james_wilson',
        first_name: 'James',
        last_name: 'Wilson',
        email: 'james.wilson@eduportal.com',
        bio: 'Dr. James Wilson is an award-winning author and creative writing professor with over 15 years of teaching experience. He has published several novels and short story collections.',
        subjects: ['Creative Writing', 'Literature', 'Poetry'],
        experience_years: 15,
        rating: 4.9,
        total_students: 900,
        courses_count: 4,
        profile_picture: null,
        location: 'Boston, MA',
        education: 'MFA in Creative Writing, Columbia University',
        specializations: ['Fiction Writing', 'Poetry', 'Literary Analysis']
      },
      {
        id: 5,
        username: 'lisa_park',
        first_name: 'Lisa',
        last_name: 'Park',
        email: 'lisa.park@eduportal.com',
        bio: 'Dr. Lisa Park is a data scientist and statistician specializing in R programming and statistical modeling. She has worked in academia and industry, helping organizations make data-driven decisions.',
        subjects: ['R Programming', 'Statistics', 'Data Analysis'],
        experience_years: 12,
        rating: 4.8,
        total_students: 1100,
        courses_count: 7,
        profile_picture: null,
        location: 'Seattle, WA',
        education: 'PhD in Statistics, University of Washington',
        specializations: ['Statistical Modeling', 'Data Visualization', 'Research Methods']
      },
      {
        id: 6,
        username: 'robert_thompson',
        first_name: 'Robert',
        last_name: 'Thompson',
        email: 'robert.thompson@eduportal.com',
        bio: 'Robert Thompson is a certified financial planner with over 20 years of experience in personal finance and investment management. He helps individuals and families achieve their financial goals.',
        subjects: ['Personal Finance', 'Investment', 'Financial Planning'],
        experience_years: 20,
        rating: 4.6,
        total_students: 800,
        courses_count: 3,
        profile_picture: null,
        location: 'Chicago, IL',
        education: 'CFP Certification, Certified Financial Planner Board',
        specializations: ['Retirement Planning', 'Investment Strategy', 'Tax Planning']
      }
    ];

    setTeachers(mockTeachers);
    setFilteredTeachers(mockTeachers);
    setLoading(false);
  }, []);

  // Filter teachers based on search and filters
  useEffect(() => {
    let filtered = teachers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subjects.some(subject => 
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        teacher.specializations.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(teacher => 
        teacher.subjects.some(subject => 
          subject.toLowerCase().includes(selectedSubject.toLowerCase())
        )
      );
    }

    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, selectedSubject]);

  const subjects = [
    'all', 'Web Development', 'Python', 'Data Science', 'Digital Marketing', 
    'Creative Writing', 'R Programming', 'Personal Finance', 'JavaScript', 
    'Machine Learning', 'SEO', 'Literature'
  ];

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
          <p className="mt-4 text-gray-600">Loading instructors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meet Our Instructors</h1>
          <p className="text-gray-600">Learn from expert teachers and industry professionals</p>
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
                  placeholder="Search instructors, subjects, or specializations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="lg:w-64">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredTeachers.length} of {teachers.length} instructors
          </p>
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                {/* Teacher Header */}
                <div className="p-6">
                  {/* Profile Picture and Basic Info */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {teacher.profile_picture ? (
                        <img 
                          src={teacher.profile_picture} 
                          alt={`${teacher.first_name} ${teacher.last_name}`}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {teacher.first_name} {teacher.last_name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{teacher.education}</p>
                      <div className="flex items-center mt-1">
                        {renderStars(teacher.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          {teacher.rating} ({teacher.total_students} students)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {teacher.bio}
                  </p>

                  {/* Location */}
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {teacher.location}
                  </div>

                  {/* Subjects */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Subjects:</h4>
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.slice(0, 3).map((subject, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                      {teacher.subjects.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{teacher.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{teacher.experience_years}</div>
                      <div className="text-xs text-gray-600">Years Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{teacher.courses_count}</div>
                      <div className="text-xs text-gray-600">Courses</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/instructors/${teacher.id}`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={`/courses?instructor=${teacher.id}`}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200 text-center"
                    >
                      View Courses
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

export default InstitutionsPage;
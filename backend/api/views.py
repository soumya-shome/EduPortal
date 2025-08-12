import logging
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import datetime, timedelta
import json

from .models import (
    User, Course, Enrollment, WeeklyDetail, StudyMaterial, 
    Exam, Question, QuestionOption, ExamAttempt, FeeTransaction,
    TeacherSalary, StudentProgress, FileUpload
)
from .serializers import (
    UserSerializer, CourseSerializer, EnrollmentSerializer, WeeklyDetailSerializer,
    StudyMaterialSerializer, ExamSerializer, QuestionSerializer, QuestionOptionSerializer,
    ExamAttemptSerializer, FeeTransactionSerializer, TeacherSalarySerializer,
    StudentProgressSerializer, FileUploadSerializer, LoginSerializer
)
from .permissions import IsTeacherOrAdmin, IsEnrolledStudentOrTeacher, IsCourseTeacherOrAdmin, IsOwnerOrAdmin
from .utils import safe_log_request, safe_log_response, safe_log_error

# Get logger for views
logger = logging.getLogger('api.views')


class AuthViewSet(viewsets.ViewSet):
    """
    Authentication endpoints for registration and login.
    """
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user using Django's built-in user creation."""
        safe_log_request(request, "AuthViewSet.register")
        
        try:
            from django.contrib.auth import login
            from django.contrib.auth.password_validation import validate_password
            
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            role = request.data.get('role', 'student')
            
            # Validate required fields
            if not username or not email or not password:
                logger.warning("Registration failed - missing required fields")
                return Response({'error': 'Username, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                logger.warning(f"Registration failed - username already exists: {username}")
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                logger.warning(f"Registration failed - email already exists: {email}")
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate password
            try:
                validate_password(password)
            except Exception as e:
                logger.warning(f"Registration failed - invalid password: {str(e)}")
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=role
            )
            
            logger.info(f"User registered successfully: {user.username} (ID: {user.id})")
            
            # Ensure superusers have admin role
            if user.is_superuser and user.role != 'admin':
                logger.info(f"Setting admin role for superuser: {user.username}")
                user.role = 'admin'
                user.save()
            
            # Log the user in
            login(request, user)
            
            response_data = {
                'user': UserSerializer(user).data,
                'message': 'Registration successful'
            }
            safe_log_response(response_data, "Registration")
            logger.info(f"Registration successful for user: {user.username}")
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            safe_log_error(e, "Registration")
            return Response({'error': 'Registration failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login user using Django's built-in authentication."""
        safe_log_request(request, "AuthViewSet.login")
        
        try:
            from django.contrib.auth import authenticate, login
            username = request.data.get('username')
            password = request.data.get('password')
            
            if not username or not password:
                logger.warning("Login failed - missing username or password")
                return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(username=username, password=password)
            
            if user is None:
                logger.warning(f"Login failed - invalid credentials for username: {username}")
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_active:
                logger.warning(f"Login failed - inactive user: {username}")
                return Response({'error': 'User account is disabled'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Ensure superusers have admin role
            if user.is_superuser and user.role != 'admin':
                logger.info(f"Setting admin role for superuser: {user.username}")
                user.role = 'admin'
                user.save()
            
            # Log the user in using Django's session
            login(request, user)
            
            logger.info(f"Login successful for user: {user.username} (ID: {user.id})")
            
            response_data = {
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            }
            safe_log_response(response_data, "Login")
            logger.info(f"Login successful for user: {user.username}")
            return Response(response_data)
        except Exception as e:
            safe_log_error(e, "Login")
            return Response({'error': 'Login failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Logout user and clear session."""
        safe_log_request(request, "AuthViewSet.logout")
        
        try:
            # Django's logout function will clear the session
            from django.contrib.auth import logout
            logout(request)
            
            logger.info(f"User logged out successfully: {request.user.username if request.user.is_authenticated else 'Anonymous'}")
            safe_log_response({'message': 'Logout successful'}, "Logout")
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            safe_log_error(e, "Logout")
            return Response({'error': 'Logout failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserViewSet(viewsets.ModelViewSet):
    """
    User management endpoints.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'username']

    def get_permissions(self):
        logger.debug(f"UserViewSet.get_permissions called for action: {self.action}")
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        logger.debug(f"Permissions for action {self.action}: {permission_classes}")
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        logger.debug(f"UserViewSet.get_queryset called by user: {self.request.user.username}")
        user = self.request.user
        if user.role == 'admin':
            logger.debug("Admin user - returning all users")
            return User.objects.all()
        else:
            logger.debug(f"Non-admin user - returning only self: {user.username}")
            return User.objects.filter(id=user.id)

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current user's profile."""
        logger.info(f"UserViewSet.profile called for user: {request.user.username}")
        
        try:
            # Ensure superusers have admin role
            if request.user.is_superuser and request.user.role != 'admin':
                logger.info(f"Setting admin role for superuser: {request.user.username}")
                request.user.role = 'admin'
                request.user.save()
            
            serializer = UserSerializer(request.user)
            logger.info(f"Profile retrieved successfully for user: {request.user.username}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Profile retrieval error: {str(e)}")
            return Response({'error': 'Failed to retrieve profile'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user's profile."""
        safe_log_request(request, f"UserViewSet.update_profile for user: {request.user.username}")
        
        try:
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                user = serializer.save()
                logger.info(f"Profile updated successfully for user: {user.username}")
                safe_log_response(serializer.data, "Profile Update")
                return Response(serializer.data)
            else:
                logger.warning(f"Profile update failed - validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            safe_log_error(e, "Profile Update")
            return Response({'error': 'Failed to update profile'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def teachers(self, request):
        """Get all teachers."""
        logger.info("UserViewSet.teachers called")
        
        try:
            teachers = User.objects.filter(role='teacher', is_active=True)
            serializer = UserSerializer(teachers, many=True)
            logger.info(f"Retrieved {len(teachers)} teachers")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Teachers retrieval error: {str(e)}")
            return Response({'error': 'Failed to retrieve teachers'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def students(self, request):
        """Get all students."""
        logger.info("UserViewSet.students called")
        
        try:
            students = User.objects.filter(role='student', is_active=True)
            serializer = UserSerializer(students, many=True)
            logger.info(f"Retrieved {len(students)} students")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Students retrieval error: {str(e)}")
            return Response({'error': 'Failed to retrieve students'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user's active status."""
        logger.info(f"UserViewSet.toggle_active called for user_id: {pk}")
        
        try:
            user = self.get_object()
            user.is_active = not user.is_active
            user.save()
            logger.info(f"User {user.username} active status toggled to: {user.is_active}")
            return Response({'is_active': user.is_active})
        except Exception as e:
            logger.error(f"Toggle active error: {str(e)}")
            return Response({'error': 'Failed to toggle user status'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def active_users(self, request):
        """Get all active users."""
        logger.info("UserViewSet.active_users called")
        
        try:
            active_users = User.objects.filter(is_active=True)
            serializer = UserSerializer(active_users, many=True)
            logger.info(f"Retrieved {len(active_users)} active users")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Active users retrieval error: {str(e)}")
            return Response({'error': 'Failed to retrieve active users'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WeeklyDetailViewSet(viewsets.ModelViewSet):
    """
    Weekly detail management endpoints.
    """
    queryset = WeeklyDetail.objects.all()
    serializer_class = WeeklyDetailSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['course', 'week_number']
    ordering_fields = ['week_number', 'created_at']

    def get_permissions(self):
        logger.debug(f"WeeklyDetailViewSet.get_permissions called for action: {self.action}")
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsTeacherOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        logger.debug(f"Permissions for action {self.action}: {permission_classes}")
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        logger.debug(f"WeeklyDetailViewSet.get_queryset called by user: {self.request.user.username}")
        user = self.request.user
        if user.role == 'admin':
            logger.debug("Admin user - returning all weekly details")
            return WeeklyDetail.objects.all()
        elif user.role == 'teacher':
            logger.debug(f"Teacher user - returning weekly details for their courses")
            return WeeklyDetail.objects.filter(course__teacher=user)
        else:
            logger.debug(f"Student user - returning weekly details for enrolled courses")
            enrolled_courses = Course.objects.filter(
                enrollments__student=user, 
                enrollments__is_active=True
            )
            return WeeklyDetail.objects.filter(course__in=enrolled_courses)

    @action(detail=False, methods=['get'])
    def course_weekly_details(self, request):
        """Get weekly details for a specific course."""
        course_id = request.query_params.get('course')
        logger.info(f"WeeklyDetailViewSet.course_weekly_details called for course_id: {course_id}")
        
        try:
            if course_id:
                weekly_details = WeeklyDetail.objects.filter(course_id=course_id).order_by('week_number')
                serializer = self.get_serializer(weekly_details, many=True)
                logger.info(f"Retrieved {len(weekly_details)} weekly details for course {course_id}")
                return Response(serializer.data)
            else:
                logger.warning("No course_id provided")
                return Response({'error': 'Course ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Course weekly details retrieval error: {str(e)}")
            return Response({'error': 'Failed to retrieve weekly details'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CourseViewSet(viewsets.ModelViewSet):
    """
    Course management endpoints.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['difficulty_level', 'is_active', 'teacher']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'fee']

    def get_permissions(self):
        logger.debug(f"CourseViewSet.get_permissions called for action: {self.action}")
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsTeacherOrAdmin]
        elif self.action in ['enroll', 'unenroll']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        logger.debug(f"Permissions for action {self.action}: {permission_classes}")
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        logger.debug(f"CourseViewSet.get_queryset called by user: {self.request.user.username}")
        user = self.request.user
        if user.role == 'teacher':
            logger.debug(f"Teacher user - returning courses taught by: {user.username}")
            return Course.objects.filter(teacher=user)
        elif user.role == 'student':
            logger.debug(f"Student user - returning active courses")
            return Course.objects.filter(is_active=True)
        else:
            logger.debug(f"Admin user - returning all courses")
            return Course.objects.all()

    def perform_create(self, serializer):
        logger.info(f"CourseViewSet.perform_create called by user: {self.request.user.username}")
        course = serializer.save(teacher=self.request.user)
        logger.info(f"Course created successfully: {course.title} (ID: {course.id})")

    @action(detail=True, methods=['get'])
    def detail(self, request, pk=None):
        """Get detailed course information."""
        logger.info(f"CourseViewSet.detail called for course_id: {pk}")
        
        try:
            course = self.get_object()
            serializer = self.get_serializer(course)
            logger.info(f"Course detail retrieved successfully: {course.title}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Course detail retrieval error: {str(e)}")
            return Response({'error': 'Failed to retrieve course details'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll a student in a course."""
        logger.info(f"CourseViewSet.enroll called for course_id: {pk} by user: {request.user.username}")
        
        try:
            course = self.get_object()
            student = request.user
            
            # Check if already enrolled
            existing_enrollment = Enrollment.objects.filter(student=student, course=course, is_active=True).first()
            if existing_enrollment:
                logger.warning(f"Student {student.username} already enrolled in course {course.title}")
                return Response({'error': 'Already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create enrollment
            enrollment = Enrollment.objects.create(student=student, course=course)
            logger.info(f"Student {student.username} enrolled successfully in course {course.title}")
            
            serializer = EnrollmentSerializer(enrollment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Enrollment error: {str(e)}")
            return Response({'error': 'Failed to enroll in course'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def unenroll(self, request, pk=None):
        """Unenroll a student from a course."""
        logger.info(f"CourseViewSet.unenroll called for course_id: {pk} by user: {request.user.username}")
        
        try:
            course = self.get_object()
            student = request.user
            
            enrollment = course.enrollments.filter(student=student, is_active=True).first()
            if not enrollment:
                logger.warning(f"Student {student.username} not enrolled in course {course.title}")
                return Response({'error': 'Not enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)
            
            enrollment.is_active = False
            enrollment.save()
            logger.info(f"Student {student.username} unenrolled successfully from course {course.title}")
            return Response({'message': 'Successfully unenrolled'})
        except Exception as e:
            logger.error(f"Unenrollment error: {str(e)}")
            return Response({'error': 'Failed to unenroll from course'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def my_courses(self, request):
        """Get courses for the current user."""
        logger.info(f"CourseViewSet.my_courses called for user: {request.user.username}")
        
        try:
            user = request.user
            if user.role == 'teacher':
                logger.debug(f"Teacher user - returning courses taught by: {user.username}")
                courses = Course.objects.filter(teacher=user)
            elif user.role == 'student':
                logger.debug(f"Student user - returning enrolled courses")
                enrollments = Enrollment.objects.filter(student=user, is_active=True)
                courses = Course.objects.filter(enrollments__in=enrollments)
            else:
                logger.debug(f"Admin user - returning all courses")
                courses = Course.objects.all()
            
            serializer = self.get_serializer(courses, many=True)
            logger.info(f"Retrieved {len(courses)} courses for user {user.username}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"My courses retrieval error: {str(e)}")
            return Response({'error': 'Failed to retrieve courses'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get students enrolled in a course."""
        logger.info(f"CourseViewSet.students called for course_id: {pk}")
        
        try:
            course = self.get_object()
            enrollments = course.enrollments.filter(is_active=True)
            serializer = EnrollmentSerializer(enrollments, many=True)
            logger.info(f"Retrieved {len(enrollments)} enrolled students for course {course.title}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Course students retrieval error: {str(e)}")
            return Response({'error': 'Failed to retrieve course students'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def progress_summary(self, request, pk=None):
        """Get course progress summary."""
        logger.info(f"CourseViewSet.progress_summary called for course_id: {pk}")
        
        try:
            course = self.get_object()
            enrollments = course.enrollments.filter(is_active=True)
            
            total_students = enrollments.count()
            completed_students = enrollments.filter(completion_percentage=100).count()
            avg_completion = enrollments.aggregate(Avg('completion_percentage'))['completion_percentage__avg'] or 0
            
            summary = {
                'total_students': total_students,
                'completed_students': completed_students,
                'avg_completion_percentage': round(avg_completion, 2),
                'completion_rate': round((completed_students / total_students * 100) if total_students > 0 else 0, 2)
            }
            
            logger.info(f"Progress summary for course {course.title}: {summary}")
            return Response(summary)
        except Exception as e:
            logger.error(f"Progress summary error: {str(e)}")
            return Response({'error': 'Failed to retrieve progress summary'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def update_schedule(self, request, pk=None):
        """Update course schedule information."""
        safe_log_request(request, f"CourseViewSet.update_schedule for course_id: {pk}")
        
        try:
            course = self.get_object()
            schedule_info = request.data.get('schedule_info')
            
            if schedule_info is not None:
                course.schedule_info = schedule_info
                course.save()
                logger.info(f"Schedule updated for course {course.title}")
            
            serializer = self.get_serializer(course)
            safe_log_response(serializer.data, "Schedule Update")
            return Response(serializer.data)
        except Exception as e:
            safe_log_error(e, "Schedule Update")
            return Response({'error': 'Failed to update schedule'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    Enrollment management endpoints.
    """
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_active', 'course', 'student']
    ordering_fields = ['enrolled_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def my_enrollments(self, request):
        """Get enrollments for the current student."""
        if request.user.role != 'student':
            return Response({'error': 'Only students can view enrollments'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        enrollments = Enrollment.objects.filter(student=request.user, is_active=True)
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['put', 'patch'])
    def update_progress(self, request, pk=None):
        """Update enrollment progress."""
        enrollment = self.get_object()
        completion_percentage = request.data.get('completion_percentage')
        
        if completion_percentage is not None:
            enrollment.completion_percentage = completion_percentage
            if completion_percentage == 100:
                enrollment.completed_at = timezone.now()
            enrollment.save()
        
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)


class FileUploadViewSet(viewsets.ModelViewSet):
    """
    File upload management endpoints.
    """
    queryset = FileUpload.objects.all()
    serializer_class = FileUploadSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['file_type', 'uploaded_by']
    ordering_fields = ['created_at']

    def get_permissions(self):
        permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download uploaded file."""
        file_upload = self.get_object()
        if file_upload.file:
            return FileResponse(file_upload.file, as_attachment=True)
        return Response({'error': 'No file available'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def my_uploads(self, request):
        """Get uploads for the current user."""
        uploads = FileUpload.objects.filter(uploaded_by=request.user)
        serializer = self.get_serializer(uploads, many=True)
        return Response(serializer.data)


class StudyMaterialViewSet(viewsets.ModelViewSet):
    """
    Study material management endpoints.
    """
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'material_type', 'is_public', 'uploaded_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsTeacherOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            return StudyMaterial.objects.filter(course__teacher=user)
        elif user.role == 'student':
            return StudyMaterial.objects.filter(
                Q(is_public=True) | Q(course__enrollments__student=user, course__enrollments__is_active=True)
            )
        else:
            return StudyMaterial.objects.all()

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download study material file."""
        material = self.get_object()
        if material.file:
            return FileResponse(material.file, as_attachment=True)
        return Response({'error': 'No file available'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def course_materials(self, request):
        """Get study materials for a specific course."""
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response({'error': 'course_id parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        materials = StudyMaterial.objects.filter(course_id=course_id)
        serializer = self.get_serializer(materials, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def public_materials(self, request):
        """Get public study materials."""
        materials = StudyMaterial.objects.filter(is_public=True)
        serializer = self.get_serializer(materials, many=True)
        return Response(serializer.data)


class ExamViewSet(viewsets.ModelViewSet):
    """
    Exam management endpoints.
    """
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'is_active', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_time', 'end_time']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsCourseTeacherOrAdmin]
        else:
            permission_classes = [IsEnrolledStudentOrTeacher]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Exam.objects.all()
        elif user.role == 'teacher':
            # Teachers can see exams for their courses
            return Exam.objects.filter(course__teacher=user)
        else:
            # Students can see exams for enrolled courses
            enrolled_courses = Course.objects.filter(
                enrollments__student=user, 
                enrollments__is_active=True
            )
            return Exam.objects.filter(course__in=enrolled_courses)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def detail(self, request, pk=None):
        """Get detailed exam information."""
        exam = self.get_object()
        serializer = ExamDetailSerializer(exam)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def start_exam(self, request, pk=None):
        """Start an exam attempt."""
        exam = self.get_object()
        student = request.user
        
        if student.role != 'student':
            return Response({'error': 'Only students can take exams'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already attempted
        if exam.attempts.filter(student=student).exists():
            return Response({'error': 'Already attempted this exam'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if exam is active and within time window
        now = timezone.now()
        if not exam.is_active or now < exam.start_time or now > exam.end_time:
            return Response({'error': 'Exam is not available'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        attempt = ExamAttempt.objects.create(student=student, exam=exam)
        serializer = ExamAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit_exam(self, request, pk=None):
        """Submit exam answers."""
        exam = self.get_object()
        student = request.user
        answers_data = request.data.get('answers', [])
        
        attempt = exam.attempts.filter(student=student).first()
        if not attempt:
            return Response({'error': 'No active exam attempt'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if attempt.completed_at:
            return Response({'error': 'Exam already submitted'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Process answers and calculate score
        total_score = 0
        for answer_data in answers_data:
            question_id = answer_data.get('question_id')
            selected_option_id = answer_data.get('selected_option_id')
            text_answer = answer_data.get('text_answer', '')
            
            question = Question.objects.get(id=question_id)
            answer = Answer.objects.create(
                exam_attempt=attempt,
                question=question,
                text_answer=text_answer
            )
            
            if selected_option_id:
                selected_option = QuestionOption.objects.get(id=selected_option_id)
                answer.selected_option = selected_option
                
                # Calculate marks for multiple choice questions
                if question.question_type == 'multiple_choice' and selected_option.is_correct:
                    answer.marks_obtained = question.marks
                    total_score += question.marks
                
                answer.save()
        
        # Update attempt
        attempt.completed_at = timezone.now()
        attempt.score = total_score
        attempt.is_passed = total_score >= exam.passing_marks
        attempt.status = 'completed'
        attempt.save()
        
        serializer = ExamAttemptSerializer(attempt)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get exam results."""
        exam = self.get_object()
        attempts = exam.attempts.all()
        serializer = ExamAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming_exams(self, request):
        """Get upcoming exams for the current user."""
        user = request.user
        if user.role == 'student':
            enrolled_courses = Course.objects.filter(
                enrollments__student=user, 
                enrollments__is_active=True
            )
            exams = Exam.objects.filter(
                course__in=enrolled_courses,
                is_active=True,
                start_time__gt=timezone.now()
            )
        elif user.role == 'teacher':
            exams = Exam.objects.filter(
                course__teacher=user,
                is_active=True,
                start_time__gt=timezone.now()
            )
        else:
            exams = Exam.objects.filter(
                is_active=True,
                start_time__gt=timezone.now()
            )
        
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def ongoing_exams(self, request):
        """Get ongoing exams for the current user."""
        user = request.user
        now = timezone.now()
        
        if user.role == 'student':
            enrolled_courses = Course.objects.filter(
                enrollments__student=user, 
                enrollments__is_active=True
            )
            exams = Exam.objects.filter(
                course__in=enrolled_courses,
                is_active=True,
                start_time__lte=now,
                end_time__gte=now
            )
        elif user.role == 'teacher':
            exams = Exam.objects.filter(
                course__teacher=user,
                is_active=True,
                start_time__lte=now,
                end_time__gte=now
            )
        else:
            exams = Exam.objects.filter(
                is_active=True,
                start_time__lte=now,
                end_time__gte=now
            )
        
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Question management endpoints.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['exam', 'question_type']
    ordering_fields = ['order', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsCourseTeacherOrAdmin]
        else:
            permission_classes = [IsEnrolledStudentOrTeacher]
        return [permission() for permission in permission_classes]


class QuestionOptionViewSet(viewsets.ModelViewSet):
    """
    Question option management endpoints.
    """
    queryset = QuestionOption.objects.all()
    serializer_class = QuestionOptionSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['question']
    ordering_fields = ['order']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsCourseTeacherOrAdmin]
        else:
            permission_classes = [IsEnrolledStudentOrTeacher]
        return [permission() for permission in permission_classes]


class ExamAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Exam attempt view endpoints.
    """
    queryset = ExamAttempt.objects.all()
    serializer_class = ExamAttemptSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['exam', 'student', 'is_passed', 'status']
    ordering_fields = ['started_at', 'completed_at', 'score']

    def get_permissions(self):
        permission_classes = [IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return ExamAttempt.objects.all()
        elif user.role == 'teacher':
            # Teachers can see attempts for their course exams
            return ExamAttempt.objects.filter(exam__course__teacher=user)
        else:
            # Students can see their own attempts
            return ExamAttempt.objects.filter(student=user)

    @action(detail=False, methods=['get'])
    def my_attempts(self, request):
        """Get exam attempts for the current user."""
        if request.user.role != 'student':
            return Response({'error': 'Student access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        attempts = ExamAttempt.objects.filter(student=request.user)
        serializer = self.get_serializer(attempts, many=True)
        return Response(serializer.data)


class FeeTransactionViewSet(viewsets.ModelViewSet):
    """
    Fee transaction management endpoints.
    """
    queryset = FeeTransaction.objects.all()
    serializer_class = FeeTransactionSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'course', 'transaction_type', 'payment_status']
    ordering_fields = ['transaction_date', 'amount']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return FeeTransaction.objects.all()
        else:
            # Users can see their own transactions
            return FeeTransaction.objects.filter(student=user)

    @action(detail=False, methods=['get'])
    def my_transactions(self, request):
        """Get transactions for the current user."""
        transactions = FeeTransaction.objects.filter(student=request.user)
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def payment_summary(self, request):
        """Get payment summary for admin."""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        total_revenue = FeeTransaction.objects.filter(
            payment_status='completed'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        monthly_revenue = FeeTransaction.objects.filter(
            payment_status='completed',
            transaction_date__month=timezone.now().month
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        pending_payments = FeeTransaction.objects.filter(
            payment_status='pending'
        ).count()
        
        return Response({
            'total_revenue': total_revenue,
            'monthly_revenue': monthly_revenue,
            'pending_payments': pending_payments
        })

    @action(detail=False, methods=['get'])
    def student_payments(self, request):
        """Get payments for a specific student."""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({'error': 'student_id parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        transactions = FeeTransaction.objects.filter(student_id=student_id)
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)


class TeacherSalaryViewSet(viewsets.ModelViewSet):
    """
    Teacher salary management endpoints.
    """
    queryset = TeacherSalary.objects.all()
    serializer_class = TeacherSalarySerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['teacher', 'payment_status', 'month']
    ordering_fields = ['month', 'total_salary']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return TeacherSalary.objects.all()
        else:
            # Teachers can see their own salary records
            return TeacherSalary.objects.filter(teacher=user)

    @action(detail=False, methods=['get'])
    def my_salary(self, request):
        """Get salary records for the current teacher."""
        if request.user.role != 'teacher':
            return Response({'error': 'Teacher access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        salaries = TeacherSalary.objects.filter(teacher=request.user)
        serializer = self.get_serializer(salaries, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark salary as paid."""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        salary = self.get_object()
        salary.payment_status = 'paid'
        salary.payment_date = timezone.now()
        salary.save()
        
        serializer = self.get_serializer(salary)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def teacher_salaries(self, request):
        """Get salaries for a specific teacher."""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        teacher_id = request.query_params.get('teacher_id')
        if not teacher_id:
            return Response({'error': 'teacher_id parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        salaries = TeacherSalary.objects.filter(teacher_id=teacher_id)
        serializer = self.get_serializer(salaries, many=True)
        return Response(serializer.data)


class StudentProgressViewSet(viewsets.ModelViewSet):
    """
    Student progress management endpoints.
    """
    queryset = StudentProgress.objects.all()
    serializer_class = StudentProgressSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'course', 'week_number']
    ordering_fields = ['week_number', 'overall_score']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsCourseTeacherOrAdmin]
        else:
            permission_classes = [IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return StudentProgress.objects.all()
        elif user.role == 'teacher':
            # Teachers can see progress for their courses
            return StudentProgress.objects.filter(course__teacher=user)
        else:
            # Students can see their own progress
            return StudentProgress.objects.filter(student=user)

    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get progress records for the current student."""
        if request.user.role != 'student':
            return Response({'error': 'Student access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        progress = StudentProgress.objects.filter(student=request.user)
        serializer = self.get_serializer(progress, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def course_progress(self, request):
        """Get progress for a specific course."""
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response({'error': 'course_id parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        progress = StudentProgress.objects.filter(
            student=request.user, 
            course_id=course_id
        )
        serializer = self.get_serializer(progress, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def student_progress(self, request):
        """Get progress for a specific student (admin/teacher only)."""
        if request.user.role not in ['admin', 'teacher']:
            return Response({'error': 'Admin or teacher access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        student_id = request.query_params.get('student_id')
        course_id = request.query_params.get('course_id')
        
        if not student_id:
            return Response({'error': 'student_id parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        filters = {'student_id': student_id}
        if course_id:
            filters['course_id'] = course_id
        
        progress = StudentProgress.objects.filter(**filters)
        serializer = self.get_serializer(progress, many=True)
        return Response(serializer.data)


class AdminViewSet(viewsets.ViewSet):
    """
    Admin-specific endpoints for dashboard and statistics.
    """
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get admin dashboard statistics."""
        # Get basic counts
        total_users = User.objects.count()
        total_students = User.objects.filter(role='student').count()
        total_teachers = User.objects.filter(role='teacher').count()
        total_courses = Course.objects.count()
        active_courses = Course.objects.filter(is_active=True).count()
        
        # Get revenue data
        total_revenue = FeeTransaction.objects.filter(
            payment_status='completed'
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Get recent activity
        recent_enrollments = Enrollment.objects.filter(
            enrolled_at__gte=datetime.now() - timedelta(days=7)
        ).count()
        
        recent_transactions = FeeTransaction.objects.filter(
            transaction_date__gte=datetime.now() - timedelta(days=7)
        ).count()
        
        # Get course statistics
        popular_courses = Course.objects.annotate(
            enrollment_count=Count('enrollments')
        ).order_by('-enrollment_count')[:5]
        
        return Response({
            'total_users': total_users,
            'total_students': total_students,
            'total_teachers': total_teachers,
            'total_courses': total_courses,
            'active_courses': active_courses,
            'total_revenue': float(total_revenue),
            'recent_enrollments': recent_enrollments,
            'recent_transactions': recent_transactions,
            'popular_courses': [
                {
                    'id': course.id,
                    'title': course.title,
                    'enrollment_count': course.enrollment_count,
                    'teacher': course.teacher.full_name
                }
                for course in popular_courses
            ]
        })

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get advanced analytics data."""
        days = int(request.query_params.get('days', 30))
        start_date = datetime.now() - timedelta(days=days)
        
        # Enrollment analytics
        total_enrollments = Enrollment.objects.filter(
            enrolled_at__gte=start_date
        ).count()
        
        previous_period_enrollments = Enrollment.objects.filter(
            enrolled_at__gte=start_date - timedelta(days=days),
            enrolled_at__lt=start_date
        ).count()
        
        enrollment_change = 0
        if previous_period_enrollments > 0:
            enrollment_change = ((total_enrollments - previous_period_enrollments) / previous_period_enrollments) * 100
        
        # Revenue analytics
        total_revenue = FeeTransaction.objects.filter(
            payment_status='completed',
            transaction_date__gte=start_date
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        previous_revenue = FeeTransaction.objects.filter(
            payment_status='completed',
            transaction_date__gte=start_date - timedelta(days=days),
            transaction_date__lt=start_date
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        revenue_change = 0
        if previous_revenue > 0:
            revenue_change = ((total_revenue - previous_revenue) / previous_revenue) * 100
        
        # Course analytics
        active_courses = Course.objects.filter(is_active=True).count()
        previous_courses = Course.objects.filter(
            created_at__gte=start_date - timedelta(days=days),
            created_at__lt=start_date
        ).count()
        
        course_change = 0
        if previous_courses > 0:
            course_change = ((active_courses - previous_courses) / previous_courses) * 100
        
        # Retention rate calculation
        total_students = User.objects.filter(role='student').count()
        active_students = User.objects.filter(
            role='student',
            enrollments__enrolled_at__gte=start_date
        ).distinct().count()
        
        retention_rate = 0
        if total_students > 0:
            retention_rate = (active_students / total_students) * 100
        
        return Response({
            'total_enrollments': total_enrollments,
            'enrollment_change': round(enrollment_change, 2),
            'total_revenue': float(total_revenue),
            'revenue_change': round(revenue_change, 2),
            'active_courses': active_courses,
            'course_change': round(course_change, 2),
            'retention_rate': round(retention_rate, 2),
            'retention_change': 0,  # Placeholder for retention change calculation
        })

    @action(detail=False, methods=['get'])
    def notifications(self, request):
        """Get system notifications."""
        # This would typically come from a Notification model
        # For now, returning mock data
        notifications = [
            {
                'id': 1,
                'title': 'System Maintenance',
                'message': 'Scheduled maintenance on December 20th, 2024',
                'type': 'info',
                'target_audience': 'all',
                'created_at': datetime.now() - timedelta(hours=2),
            },
            {
                'id': 2,
                'title': 'New Course Available',
                'message': 'Advanced Python Programming course is now live',
                'type': 'success',
                'target_audience': 'students',
                'created_at': datetime.now() - timedelta(days=1),
            },
            {
                'id': 3,
                'title': 'Payment Issue',
                'message': 'Some payment transactions failed to process',
                'type': 'warning',
                'target_audience': 'admins',
                'created_at': datetime.now() - timedelta(days=2),
            },
        ]
        
        return Response(notifications)

    @action(detail=False, methods=['post'])
    def create_notification(self, request):
        """Create a new system notification."""
        # This would typically save to a Notification model
        # For now, just returning success
        return Response({
            'message': 'Notification created successfully',
            'id': 4
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def settings(self, request):
        """Get system settings."""
        # This would typically come from a Settings model
        # For now, returning default settings
        settings = {
            'site_name': 'EduPortal',
            'site_description': 'Advanced Learning Management System',
            'contact_email': 'admin@eduportal.com',
            'max_file_size': 10,
            'session_timeout': 30,
            'enable_registration': True,
            'enable_notifications': True,
            'maintenance_mode': False,
            'backup_frequency': 'daily',
            'email_notifications': True,
            'sms_notifications': False,
            'default_currency': 'USD',
            'tax_rate': 0,
            'max_course_enrollment': 50,
            'exam_time_limit': 60,
        }
        
        return Response(settings)

    @action(detail=False, methods=['put'])
    def update_settings(self, request):
        """Update system settings."""
        # This would typically save to a Settings model
        # For now, just returning success
        return Response({
            'message': 'Settings updated successfully'
        })

    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """Get recent activity for admin dashboard."""
        # Get recent enrollments
        recent_enrollments = Enrollment.objects.select_related(
            'student', 'course'
        ).order_by('-enrolled_at')[:10]
        
        # Get recent transactions
        recent_transactions = FeeTransaction.objects.select_related(
            'student', 'course'
        ).order_by('-transaction_date')[:10]
        
        # Get recent course creations
        recent_courses = Course.objects.select_related('teacher').order_by('-created_at')[:5]
        
        activities = []
        
        # Add enrollments
        for enrollment in recent_enrollments:
            activities.append({
                'type': 'enrollment',
                'title': f'New enrollment in {enrollment.course.title}',
                'description': f'{enrollment.student.full_name} enrolled',
                'timestamp': enrollment.enrolled_at,
                'icon': 'user-plus'
            })
        
        # Add transactions
        for transaction in recent_transactions:
            activities.append({
                'type': 'transaction',
                'title': f'Payment received: ${transaction.amount}',
                'description': f'{transaction.student.full_name} - {transaction.course.title}',
                'timestamp': transaction.transaction_date,
                'icon': 'dollar-sign'
            })
        
        # Add course creations
        for course in recent_courses:
            activities.append({
                'type': 'course',
                'title': f'New course created: {course.title}',
                'description': f'by {course.teacher.full_name}',
                'timestamp': course.created_at,
                'icon': 'book-open'
            })
        
        # Sort by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response(activities[:15])  # Return top 15 activities

    @action(detail=False, methods=['get'])
    def financial_summary(self, request):
        """Get financial summary for admin dashboard."""
        # Get monthly revenue
        current_month = datetime.now().replace(day=1)
        monthly_revenue = FeeTransaction.objects.filter(
            payment_status='completed',
            transaction_date__gte=current_month
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Get revenue by transaction type
        revenue_by_type = FeeTransaction.objects.filter(
            payment_status='completed'
        ).values('transaction_type').annotate(
            total=Sum('amount')
        )
        
        # Get pending payments
        pending_payments = FeeTransaction.objects.filter(
            payment_status='pending'
        ).count()
        
        # Get total revenue
        total_revenue = FeeTransaction.objects.filter(
            payment_status='completed'
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        return Response({
            'monthly_revenue': float(monthly_revenue),
            'total_revenue': float(total_revenue),
            'revenue_by_type': [
                {
                    'type': item['transaction_type'],
                    'total': float(item['total'])
                }
                for item in revenue_by_type
            ],
            'pending_payments': pending_payments
        }) 
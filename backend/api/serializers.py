import logging
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Course, Enrollment, WeeklyDetail, StudyMaterial, 
    Exam, Question, QuestionOption, ExamAttempt, FeeTransaction,
    TeacherSalary, StudentProgress, FileUpload
)

# Get logger for serializers
logger = logging.getLogger('api.serializers')


class UserSerializer(serializers.ModelSerializer):
    """User serializer for general user operations."""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'phone', 'address', 'date_of_birth', 'bio', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def to_representation(self, instance):
        logger.debug(f"UserSerializer.to_representation called for user_id: {instance.id}")
        data = super().to_representation(instance)
        data['full_name'] = instance.full_name
        logger.debug(f"User representation created for: {instance.username}")
        return data

    def create(self, validated_data):
        logger.info(f"UserSerializer.create called with data: {validated_data}")
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        
        if password:
            logger.debug(f"Setting password for user: {user.username}")
            user.set_password(password)
            user.save()
        
        logger.info(f"User created successfully: {user.username} (ID: {user.id})")
        return user

    def update(self, instance, validated_data):
        logger.info(f"UserSerializer.update called for user_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        
        if password:
            logger.debug(f"Updating password for user: {user.username}")
            user.set_password(password)
            user.save()
        
        logger.info(f"User updated successfully: {user.username}")
        return user

    def validate_username(self, value):
        logger.debug(f"UserSerializer.validate_username called with value: {value}")
        # Get the current instance (for updates) or None (for creates)
        instance = getattr(self, 'instance', None)
        
        # Check if username exists, excluding current user for updates
        if instance:
            # Update case - exclude current user
            if User.objects.filter(username=value).exclude(pk=instance.pk).exists():
                logger.warning(f"Username already exists: {value}")
                raise serializers.ValidationError("Username already exists.")
        else:
            # Create case - check if username exists
            if User.objects.filter(username=value).exists():
                logger.warning(f"Username already exists: {value}")
                raise serializers.ValidationError("Username already exists.")
        
        return value

    def validate_email(self, value):
        logger.debug(f"UserSerializer.validate_email called with value: {value}")
        # Get the current instance (for updates) or None (for creates)
        instance = getattr(self, 'instance', None)
        
        # Check if email exists, excluding current user for updates
        if instance:
            # Update case - exclude current user
            if User.objects.filter(email=value).exclude(pk=instance.pk).exists():
                logger.warning(f"Email already exists: {value}")
                raise serializers.ValidationError("Email already exists.")
        else:
            # Create case - check if email exists
            if User.objects.filter(email=value).exists():
                logger.warning(f"Email already exists: {value}")
                raise serializers.ValidationError("Email already exists.")
        
        return value


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        logger.info(f"LoginSerializer.validate called for username: {attrs.get('username')}")
        
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            logger.debug(f"Attempting authentication for user: {username}")
            user = authenticate(username=username, password=password)
            
            if user:
                logger.info(f"Authentication successful for user: {username}")
                if not user.is_active:
                    logger.warning(f"Login attempt for inactive user: {username}")
                    raise serializers.ValidationError("User account is disabled.")
                attrs['user'] = user
                return attrs
            else:
                logger.warning(f"Authentication failed for user: {username}")
                raise serializers.ValidationError("Invalid credentials.")
        else:
            logger.warning("Login attempt with missing credentials")
            raise serializers.ValidationError("Must include 'username' and 'password'.")
        
        return attrs


class CourseSerializer(serializers.ModelSerializer):
    """Course serializer."""
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    enrolled_students_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'teacher', 'teacher_name',
            'difficulty_level', 'duration_weeks', 'fee', 'syllabus',
            'prerequisites', 'max_students', 'thumbnail', 'schedule_info',
            'is_active', 'enrolled_students_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        logger.debug(f"CourseSerializer.to_representation called for course_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Course representation created for: {instance.title}")
        return data

    def create(self, validated_data):
        logger.info(f"CourseSerializer.create called with data: {validated_data}")
        course = super().create(validated_data)
        logger.info(f"Course created successfully: {course.title} (ID: {course.id})")
        return course

    def update(self, instance, validated_data):
        logger.info(f"CourseSerializer.update called for course_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        course = super().update(instance, validated_data)
        logger.info(f"Course updated successfully: {course.title}")
        return course


class EnrollmentSerializer(serializers.ModelSerializer):
    """Enrollment serializer."""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'course', 'course_title',
            'enrolled_at', 'completion_percentage', 'is_active',
            'completed_at'
        ]
        read_only_fields = ['id', 'enrolled_at', 'completed_at']

    def to_representation(self, instance):
        logger.debug(f"EnrollmentSerializer.to_representation called for enrollment_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Enrollment representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"EnrollmentSerializer.create called with data: {validated_data}")
        enrollment = super().create(validated_data)
        logger.info(f"Enrollment created successfully: {enrollment}")
        return enrollment

    def update(self, instance, validated_data):
        logger.info(f"EnrollmentSerializer.update called for enrollment_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        enrollment = super().update(instance, validated_data)
        logger.info(f"Enrollment updated successfully: {enrollment}")
        return enrollment


class WeeklyDetailSerializer(serializers.ModelSerializer):
    """Weekly detail serializer."""
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = WeeklyDetail
        fields = [
            'id', 'course', 'course_title', 'week_number', 'title',
            'description', 'topics_covered', 'assignments', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        logger.debug(f"WeeklyDetailSerializer.to_representation called for weekly_detail_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Weekly detail representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"WeeklyDetailSerializer.create called with data: {validated_data}")
        weekly_detail = super().create(validated_data)
        logger.info(f"Weekly detail created successfully: {weekly_detail}")
        return weekly_detail

    def update(self, instance, validated_data):
        logger.info(f"WeeklyDetailSerializer.update called for weekly_detail_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        weekly_detail = super().update(instance, validated_data)
        logger.info(f"Weekly detail updated successfully: {weekly_detail}")
        return weekly_detail


class StudyMaterialSerializer(serializers.ModelSerializer):
    """Study material serializer."""
    course_title = serializers.CharField(source='course.title', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)

    class Meta:
        model = StudyMaterial
        fields = [
            'id', 'course', 'course_title', 'title', 'description',
            'material_type', 'file_url', 'week_number', 'is_public',
            'uploaded_by', 'uploaded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        logger.debug(f"StudyMaterialSerializer.to_representation called for study_material_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Study material representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"StudyMaterialSerializer.create called with data: {validated_data}")
        study_material = super().create(validated_data)
        logger.info(f"Study material created successfully: {study_material}")
        return study_material

    def update(self, instance, validated_data):
        logger.info(f"StudyMaterialSerializer.update called for study_material_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        study_material = super().update(instance, validated_data)
        logger.info(f"Study material updated successfully: {study_material}")
        return study_material


class ExamSerializer(serializers.ModelSerializer):
    """Exam serializer."""
    course_title = serializers.CharField(source='course.title', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = Exam
        fields = [
            'id', 'course', 'course_title', 'title', 'description',
            'start_time', 'end_time', 'duration_minutes', 'total_marks',
            'passing_marks', 'is_active', 'created_by', 'created_by_name',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        logger.debug(f"ExamSerializer.to_representation called for exam_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Exam representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"ExamSerializer.create called with data: {validated_data}")
        exam = super().create(validated_data)
        logger.info(f"Exam created successfully: {exam}")
        return exam

    def update(self, instance, validated_data):
        logger.info(f"ExamSerializer.update called for exam_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        exam = super().update(instance, validated_data)
        logger.info(f"Exam updated successfully: {exam}")
        return exam


class QuestionSerializer(serializers.ModelSerializer):
    """Question serializer."""
    exam_title = serializers.CharField(source='exam.title', read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'exam', 'exam_title', 'question_type', 'text',
            'marks', 'order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        logger.debug(f"QuestionSerializer.to_representation called for question_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Question representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"QuestionSerializer.create called with data: {validated_data}")
        question = super().create(validated_data)
        logger.info(f"Question created successfully: {question}")
        return question

    def update(self, instance, validated_data):
        logger.info(f"QuestionSerializer.update called for question_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        question = super().update(instance, validated_data)
        logger.info(f"Question updated successfully: {question}")
        return question


class QuestionOptionSerializer(serializers.ModelSerializer):
    """Question option serializer."""
    question_text = serializers.CharField(source='question.text', read_only=True)

    class Meta:
        model = QuestionOption
        fields = [
            'id', 'question', 'question_text', 'text', 'is_correct', 'order'
        ]
        read_only_fields = ['id']

    def to_representation(self, instance):
        logger.debug(f"QuestionOptionSerializer.to_representation called for option_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Question option representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"QuestionOptionSerializer.create called with data: {validated_data}")
        option = super().create(validated_data)
        logger.info(f"Question option created successfully: {option}")
        return option

    def update(self, instance, validated_data):
        logger.info(f"QuestionOptionSerializer.update called for option_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        option = super().update(instance, validated_data)
        logger.info(f"Question option updated successfully: {option}")
        return option


class ExamAttemptSerializer(serializers.ModelSerializer):
    """Exam attempt serializer."""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)

    class Meta:
        model = ExamAttempt
        fields = [
            'id', 'exam', 'exam_title', 'student', 'student_name',
            'started_at', 'completed_at', 'score', 'is_passed', 'status'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at']

    def to_representation(self, instance):
        logger.debug(f"ExamAttemptSerializer.to_representation called for attempt_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Exam attempt representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"ExamAttemptSerializer.create called with data: {validated_data}")
        attempt = super().create(validated_data)
        logger.info(f"Exam attempt created successfully: {attempt}")
        return attempt

    def update(self, instance, validated_data):
        logger.info(f"ExamAttemptSerializer.update called for attempt_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        attempt = super().update(instance, validated_data)
        logger.info(f"Exam attempt updated successfully: {attempt}")
        return attempt


class FeeTransactionSerializer(serializers.ModelSerializer):
    """Fee transaction serializer."""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = FeeTransaction
        fields = [
            'id', 'student', 'student_name', 'course', 'course_title',
            'transaction_type', 'amount', 'payment_status', 'transaction_date',
            'description'
        ]
        read_only_fields = ['id', 'transaction_date']

    def to_representation(self, instance):
        logger.debug(f"FeeTransactionSerializer.to_representation called for transaction_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Fee transaction representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"FeeTransactionSerializer.create called with data: {validated_data}")
        transaction = super().create(validated_data)
        logger.info(f"Fee transaction created successfully: {transaction}")
        return transaction

    def update(self, instance, validated_data):
        logger.info(f"FeeTransactionSerializer.update called for transaction_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        transaction = super().update(instance, validated_data)
        logger.info(f"Fee transaction updated successfully: {transaction}")
        return transaction


class TeacherSalarySerializer(serializers.ModelSerializer):
    """Teacher salary serializer."""
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)

    class Meta:
        model = TeacherSalary
        fields = [
            'id', 'teacher', 'teacher_name', 'month', 'base_salary',
            'bonus', 'deductions', 'total_salary', 'payment_status',
            'payment_date', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        logger.debug(f"TeacherSalarySerializer.to_representation called for salary_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Teacher salary representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"TeacherSalarySerializer.create called with data: {validated_data}")
        salary = super().create(validated_data)
        logger.info(f"Teacher salary created successfully: {salary}")
        return salary

    def update(self, instance, validated_data):
        logger.info(f"TeacherSalarySerializer.update called for salary_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        salary = super().update(instance, validated_data)
        logger.info(f"Teacher salary updated successfully: {salary}")
        return salary


class StudentProgressSerializer(serializers.ModelSerializer):
    """Student progress serializer."""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = StudentProgress
        fields = [
            'id', 'student', 'student_name', 'course', 'course_title',
            'week_number', 'attendance_percentage', 'assignment_score',
            'quiz_score', 'overall_score', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        logger.debug(f"StudentProgressSerializer.to_representation called for progress_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"Student progress representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"StudentProgressSerializer.create called with data: {validated_data}")
        progress = super().create(validated_data)
        logger.info(f"Student progress created successfully: {progress}")
        return progress

    def update(self, instance, validated_data):
        logger.info(f"StudentProgressSerializer.update called for progress_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        progress = super().update(instance, validated_data)
        logger.info(f"Student progress updated successfully: {progress}")
        return progress


class FileUploadSerializer(serializers.ModelSerializer):
    """File upload serializer."""
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)

    class Meta:
        model = FileUpload
        fields = [
            'id', 'file', 'file_name', 'file_type', 'file_size',
            'uploaded_by', 'uploaded_by_name', 'related_model', 'related_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        logger.debug(f"FileUploadSerializer.to_representation called for file_id: {instance.id}")
        data = super().to_representation(instance)
        logger.debug(f"File upload representation created for: {instance}")
        return data

    def create(self, validated_data):
        logger.info(f"FileUploadSerializer.create called with data: {validated_data}")
        file_upload = super().create(validated_data)
        logger.info(f"File upload created successfully: {file_upload}")
        return file_upload

    def update(self, instance, validated_data):
        logger.info(f"FileUploadSerializer.update called for file_id: {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        file_upload = super().update(instance, validated_data)
        logger.info(f"File upload updated successfully: {file_upload}")
        return file_upload 
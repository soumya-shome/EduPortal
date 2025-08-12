import logging
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.db.models import Avg
import os

# Get logger for models
logger = logging.getLogger('api.models')

class User(AbstractUser):
    """
    Custom User model with role-based access control.
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Add related_name to avoid conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='api_user_set',
        related_query_name='api_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='api_user_set',
        related_query_name='api_user',
    )

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        logger.debug(f"User.__str__ called for user_id={self.id}, username={self.username}")
        return f"{self.get_full_name()} ({self.role})"

    def save(self, *args, **kwargs):
        logger.info(f"User.save called for user_id={self.id if self.id else 'NEW'}, username={self.username}")
        
        # Automatically set admin role for superusers
        if self.is_superuser and self.role != 'admin':
            logger.info(f"Setting admin role for superuser: {self.username}")
            self.role = 'admin'
        
        # Log role changes
        if self.pk:  # Existing user
            try:
                old_user = User.objects.get(pk=self.pk)
                if old_user.role != self.role:
                    logger.info(f"Role changed for user {self.username}: {old_user.role} -> {self.role}")
            except User.DoesNotExist:
                logger.warning(f"Could not find existing user with pk={self.pk} for role comparison")
        
        super().save(*args, **kwargs)
        logger.info(f"User saved successfully: {self.username} (ID: {self.id})")

    @property
    def full_name(self):
        logger.debug(f"User.full_name property accessed for user_id={self.id}")
        return f"{self.first_name} {self.last_name}".strip()

    def delete(self, *args, **kwargs):
        logger.warning(f"User.delete called for user_id={self.id}, username={self.username}")
        super().delete(*args, **kwargs)
        logger.info(f"User deleted: {self.username} (ID: {self.id})")


class Course(models.Model):
    """
    Course model for educational content.
    """
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught')
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    duration_weeks = models.PositiveIntegerField(default=8)
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    syllabus = models.TextField(blank=True, null=True)
    prerequisites = models.TextField(blank=True, null=True)
    max_students = models.PositiveIntegerField(default=50)
    schedule_info = models.TextField(blank=True, null=True)  # Course schedule information
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']

    def __str__(self):
        logger.debug(f"Course.__str__ called for course_id={self.id}, title={self.title}")
        return self.title

    @property
    def enrolled_students_count(self):
        logger.debug(f"Course.enrolled_students_count accessed for course_id={self.id}")
        count = self.enrollments.filter(is_active=True).count()
        logger.debug(f"Enrolled students count for course {self.title}: {count}")
        return count

    @property
    def average_rating(self):
        logger.debug(f"Course.average_rating accessed for course_id={self.id}")
        ratings = self.enrollments.filter(is_active=True, rating__isnull=False)
        if ratings.exists():
            avg_rating = ratings.aggregate(Avg('rating'))['rating__avg']
            logger.debug(f"Average rating for course {self.title}: {avg_rating}")
            return avg_rating
        logger.debug(f"No ratings found for course {self.title}")
        return None

    def save(self, *args, **kwargs):
        logger.info(f"Course.save called for course_id={self.id if self.id else 'NEW'}, title={self.title}")
        
        # Log teacher assignment
        if self.teacher:
            logger.info(f"Course '{self.title}' assigned to teacher: {self.teacher.username}")
        
        super().save(*args, **kwargs)
        logger.info(f"Course saved successfully: {self.title} (ID: {self.id})")

    def delete(self, *args, **kwargs):
        logger.warning(f"Course.delete called for course_id={self.id}, title={self.title}")
        super().delete(*args, **kwargs)
        logger.info(f"Course deleted: {self.title} (ID: {self.id})")


class WeeklyDetail(models.Model):
    """
    Weekly details for courses.
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='weekly_details')
    week_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    topics_covered = models.TextField()
    assignments = models.TextField(blank=True, null=True)
    schedule_date = models.DateField(blank=True, null=True)  # Specific date for this week
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'weekly_details'
        unique_together = ['course', 'week_number']
        ordering = ['week_number']

    def __str__(self):
        logger.debug(f"WeeklyDetail.__str__ called for weekly_detail_id={self.id}")
        return f"Week {self.week_number} - {self.title}"

    def save(self, *args, **kwargs):
        logger.info(f"WeeklyDetail.save called for weekly_detail_id={self.id if self.id else 'NEW'}")
        logger.info(f"Course: {self.course.title}, Week: {self.week_number}")
        super().save(*args, **kwargs)
        logger.info(f"WeeklyDetail saved successfully: {self}")


class Enrollment(models.Model):
    """
    Student enrollment in courses.
    """
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completion_percentage = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    review = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'enrollments'
        unique_together = ['student', 'course']
        ordering = ['-enrolled_at']

    def __str__(self):
        logger.debug(f"Enrollment.__str__ called for enrollment_id={self.id}")
        return f"{self.student.username} - {self.course.title}"

    def save(self, *args, **kwargs):
        logger.info(f"Enrollment.save called for enrollment_id={self.id if self.id else 'NEW'}")
        logger.info(f"Student: {self.student.username}, Course: {self.course.title}")
        
        # Log completion status changes
        if self.pk:  # Existing enrollment
            try:
                old_enrollment = Enrollment.objects.get(pk=self.pk)
                if old_enrollment.completion_percentage != self.completion_percentage:
                    logger.info(f"Completion percentage changed for {self}: {old_enrollment.completion_percentage}% -> {self.completion_percentage}%")
                
                if old_enrollment.is_active != self.is_active:
                    logger.info(f"Active status changed for {self}: {old_enrollment.is_active} -> {self.is_active}")
            except Enrollment.DoesNotExist:
                logger.warning(f"Could not find existing enrollment with pk={self.pk} for comparison")
        
        super().save(*args, **kwargs)
        logger.info(f"Enrollment saved successfully: {self}")

    def delete(self, *args, **kwargs):
        logger.warning(f"Enrollment.delete called for enrollment_id={self.id}")
        logger.warning(f"Student: {self.student.username}, Course: {self.course.title}")
        super().delete(*args, **kwargs)
        logger.info(f"Enrollment deleted: {self}")


class StudyMaterial(models.Model):
    """
    Study materials for courses.
    """
    MATERIAL_TYPE_CHOICES = [
        ('document', 'Document'),
        ('video', 'Video'),
        ('link', 'Link'),
        ('presentation', 'Presentation'),
        ('assignment', 'Assignment'),
        ('pdf', 'PDF'),
        ('image', 'Image'),
        ('audio', 'Audio'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='study_materials')
    title = models.CharField(max_length=200)
    description = models.TextField()
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES, default='document')
    file = models.FileField(upload_to='study_materials/', blank=True, null=True)
    file_url = models.URLField(blank=True, null=True)
    file_size = models.PositiveIntegerField(blank=True, null=True)  # File size in bytes
    is_public = models.BooleanField(default=False)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_materials')
    week_number = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'study_materials'
        ordering = ['-created_at']

    def __str__(self):
        logger.debug(f"StudyMaterial.__str__ called for study_material_id={self.id}")
        return f"{self.title} - {self.course.title}"

    def save(self, *args, **kwargs):
        logger.info(f"StudyMaterial.save called for study_material_id={self.id if self.id else 'NEW'}")
        logger.info(f"Title: {self.title}, Course: {self.course.title}, Type: {self.material_type}")
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)
        logger.info(f"StudyMaterial saved successfully: {self}")

    @property
    def file_extension(self):
        logger.debug(f"StudyMaterial.file_extension accessed for study_material_id={self.id}")
        if self.file:
            ext = os.path.splitext(self.file.name)[1].lower()
            logger.debug(f"File extension for {self.title}: {ext}")
            return ext
        logger.debug(f"No file found for {self.title}")
        return None

    @property
    def file_name(self):
        logger.debug(f"StudyMaterial.file_name accessed for study_material_id={self.id}")
        if self.file:
            name = os.path.basename(self.file.name)
            logger.debug(f"File name for {self.title}: {name}")
            return name
        logger.debug(f"No file found for {self.title}")
        return None


class Exam(models.Model):
    """
    Exam model for course assessments.
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exams')
    duration_minutes = models.PositiveIntegerField(default=60)
    total_marks = models.PositiveIntegerField(default=100)
    passing_marks = models.PositiveIntegerField(default=40)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_exams')
    instructions = models.TextField(blank=True, null=True)  # Exam instructions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'exams'
        ordering = ['-created_at']

    def __str__(self):
        logger.debug(f"Exam.__str__ called for exam_id={self.id}")
        return f"{self.title} - {self.course.title}"

    @property
    def is_ongoing(self):
        logger.debug(f"Exam.is_ongoing accessed for exam_id={self.id}")
        now = timezone.now()
        is_ongoing = self.start_time <= now <= self.end_time
        logger.debug(f"Exam {self.title} ongoing status: {is_ongoing}")
        return is_ongoing

    @property
    def is_upcoming(self):
        logger.debug(f"Exam.is_upcoming accessed for exam_id={self.id}")
        now = timezone.now()
        is_upcoming = now < self.start_time
        logger.debug(f"Exam {self.title} upcoming status: {is_upcoming}")
        return is_upcoming

    @property
    def is_completed(self):
        logger.debug(f"Exam.is_completed accessed for exam_id={self.id}")
        now = timezone.now()
        is_completed = now > self.end_time
        logger.debug(f"Exam {self.title} completed status: {is_completed}")
        return is_completed

    def save(self, *args, **kwargs):
        logger.info(f"Exam.save called for exam_id={self.id if self.id else 'NEW'}")
        logger.info(f"Title: {self.title}, Course: {self.course.title}")
        logger.info(f"Duration: {self.duration_minutes} minutes, Total Marks: {self.total_marks}")
        super().save(*args, **kwargs)
        logger.info(f"Exam saved successfully: {self}")


class Question(models.Model):
    """
    Questions for exams.
    """
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('essay', 'Essay'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
    ]
    
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice')
    marks = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'questions'
        ordering = ['order']

    def __str__(self):
        logger.debug(f"Question.__str__ called for question_id={self.id}")
        return f"Question {self.order} - {self.exam.title}"

    def save(self, *args, **kwargs):
        logger.info(f"Question.save called for question_id={self.id if self.id else 'NEW'}")
        logger.info(f"Exam: {self.exam.title}, Type: {self.question_type}, Marks: {self.marks}")
        super().save(*args, **kwargs)
        logger.info(f"Question saved successfully: {self}")


class QuestionOption(models.Model):
    """
    Options for multiple choice questions.
    """
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'question_options'
        ordering = ['order']

    def __str__(self):
        logger.debug(f"QuestionOption.__str__ called for option_id={self.id}")
        return f"{self.option_text} - {self.question.question_text[:50]}"

    def save(self, *args, **kwargs):
        logger.info(f"QuestionOption.save called for option_id={self.id if self.id else 'NEW'}")
        logger.info(f"Question: {self.question.question_text[:50]}, Correct: {self.is_correct}")
        super().save(*args, **kwargs)
        logger.info(f"QuestionOption saved successfully: {self}")


class ExamAttempt(models.Model):
    """
    Student attempts for exams.
    """
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    score = models.PositiveIntegerField(default=0)
    is_passed = models.BooleanField(default=False)
    time_taken_minutes = models.PositiveIntegerField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=[
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ], default='in_progress')

    class Meta:
        db_table = 'exam_attempts'
        unique_together = ['student', 'exam']
        ordering = ['-started_at']

    def __str__(self):
        logger.debug(f"ExamAttempt.__str__ called for attempt_id={self.id}")
        return f"{self.student.username} - {self.exam.title}"

    def save(self, *args, **kwargs):
        logger.info(f"ExamAttempt.save called for attempt_id={self.id if self.id else 'NEW'}")
        logger.info(f"Student: {self.student.username}, Exam: {self.exam.title}, Status: {self.status}")
        
        # Log status changes
        if self.pk:  # Existing attempt
            try:
                old_attempt = ExamAttempt.objects.get(pk=self.pk)
                if old_attempt.status != self.status:
                    logger.info(f"Status changed for {self}: {old_attempt.status} -> {self.status}")
                
                if old_attempt.score != self.score:
                    logger.info(f"Score changed for {self}: {old_attempt.score} -> {self.score}")
            except ExamAttempt.DoesNotExist:
                logger.warning(f"Could not find existing attempt with pk={self.pk} for comparison")
        
        super().save(*args, **kwargs)
        logger.info(f"ExamAttempt saved successfully: {self}")


class Answer(models.Model):
    """
    Student answers for exam questions.
    """
    exam_attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    selected_option = models.ForeignKey(QuestionOption, on_delete=models.CASCADE, blank=True, null=True)
    text_answer = models.TextField(blank=True, null=True)
    marks_obtained = models.PositiveIntegerField(default=0)
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = 'answers'
        unique_together = ['exam_attempt', 'question']

    def __str__(self):
        logger.debug(f"Answer.__str__ called for answer_id={self.id}")
        return f"Answer for {self.question.question_text[:50]}"


class FeeTransaction(models.Model):
    """
    Fee transactions for courses.
    """
    TRANSACTION_TYPE_CHOICES = [
        ('course', 'Course Fee'),
        ('exam', 'Exam Fee'),
        ('material', 'Study Material'),
        ('other', 'Other'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('online', 'Online Payment'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fee_transactions')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='fee_transactions', blank=True, null=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES, default='course')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='online')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    transaction_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fee_transactions'
        ordering = ['-transaction_date']

    def __str__(self):
        logger.debug(f"FeeTransaction.__str__ called for transaction_id={self.id}")
        return f"{self.student.username} - {self.amount} - {self.transaction_type}"

    def save(self, *args, **kwargs):
        logger.info(f"FeeTransaction.save called for transaction_id={self.id if self.id else 'NEW'}")
        logger.info(f"Student: {self.student.username}, Type: {self.transaction_type}, Amount: ${self.amount}")
        
        # Log payment status changes
        if self.pk:  # Existing transaction
            try:
                old_transaction = FeeTransaction.objects.get(pk=self.pk)
                if old_transaction.payment_status != self.payment_status:
                    logger.info(f"Payment status changed for {self}: {old_transaction.payment_status} -> {self.payment_status}")
            except FeeTransaction.DoesNotExist:
                logger.warning(f"Could not find existing transaction with pk={self.pk} for comparison")
        
        super().save(*args, **kwargs)
        logger.info(f"FeeTransaction saved successfully: {self}")


class TeacherSalary(models.Model):
    """
    Teacher salary management.
    """
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]
    
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='salary_records')
    month = models.DateField()
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_salary = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_date = models.DateTimeField(blank=True, null=True)
    payment_method = models.CharField(max_length=20, choices=FeeTransaction.PAYMENT_METHOD_CHOICES, default='bank_transfer')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teacher_salaries'
        unique_together = ['teacher', 'month']
        ordering = ['-month']

    def __str__(self):
        logger.debug(f"TeacherSalary.__str__ called for salary_id={self.id}")
        return f"{self.teacher.username} - {self.month.strftime('%B %Y')}"

    def save(self, *args, **kwargs):
        logger.info(f"TeacherSalary.save called for salary_id={self.id if self.id else 'NEW'}")
        logger.info(f"Teacher: {self.teacher.username}, Month: {self.month}, Total: ${self.total_salary}")
        
        # Calculate total salary
        self.total_salary = self.base_salary + self.bonus - self.deductions
        
        # Log payment status changes
        if self.pk:  # Existing salary
            try:
                old_salary = TeacherSalary.objects.get(pk=self.pk)
                if old_salary.payment_status != self.payment_status:
                    logger.info(f"Payment status changed for {self}: {old_salary.payment_status} -> {self.payment_status}")
            except TeacherSalary.DoesNotExist:
                logger.warning(f"Could not find existing salary with pk={self.pk} for comparison")
        
        super().save(*args, **kwargs)
        logger.info(f"TeacherSalary saved successfully: {self}")


class StudentProgress(models.Model):
    """
    Student progress tracking.
    """
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress_records')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='progress_records')
    week_number = models.PositiveIntegerField()
    attendance_percentage = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    assignment_score = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        blank=True, null=True
    )
    quiz_score = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        blank=True, null=True
    )
    participation_score = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        blank=True, null=True
    )
    overall_score = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    teacher_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_progress'
        unique_together = ['student', 'course', 'week_number']
        ordering = ['week_number']

    def __str__(self):
        logger.debug(f"StudentProgress.__str__ called for progress_id={self.id}")
        return f"{self.student.username} - Week {self.week_number} - {self.course.title}"

    def save(self, *args, **kwargs):
        logger.info(f"StudentProgress.save called for progress_id={self.id if self.id else 'NEW'}")
        logger.info(f"Student: {self.student.username}, Course: {self.course.title}, Week: {self.week_number}")
        
        # Calculate overall score
        scores = []
        if self.assignment_score is not None:
            scores.append(self.assignment_score)
        if self.quiz_score is not None:
            scores.append(self.quiz_score)
        if self.participation_score is not None:
            scores.append(self.participation_score)
        
        if scores:
            self.overall_score = sum(scores) // len(scores)
        else:
            self.overall_score = self.attendance_percentage
        
        # Log score changes
        if self.pk:  # Existing progress
            try:
                old_progress = StudentProgress.objects.get(pk=self.pk)
                if old_progress.overall_score != self.overall_score:
                    logger.info(f"Overall score changed for {self}: {old_progress.overall_score}% -> {self.overall_score}%")
            except StudentProgress.DoesNotExist:
                logger.warning(f"Could not find existing progress with pk={self.pk} for comparison")
        
        super().save(*args, **kwargs)
        logger.info(f"StudentProgress saved successfully: {self}")


class FileUpload(models.Model):
    """
    Model for handling file uploads with better organization.
    """
    FILE_TYPE_CHOICES = [
        ('study_material', 'Study Material'),
        ('assignment', 'Assignment'),
        ('exam', 'Exam'),
        ('profile_picture', 'Profile Picture'),
        ('course_thumbnail', 'Course Thumbnail'),
        ('other', 'Other'),
    ]
    
    file = models.FileField(upload_to='uploads/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES)
    file_size = models.PositiveIntegerField()  # Size in bytes
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploads')
    related_model = models.CharField(max_length=50, blank=True, null=True)  # Related model name
    related_id = models.PositiveIntegerField(blank=True, null=True)  # Related object ID
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'file_uploads'
        ordering = ['-created_at']

    def __str__(self):
        logger.debug(f"FileUpload.__str__ called for file_id={self.id}")
        return f"{self.file_name} - {self.file_type}"

    def save(self, *args, **kwargs):
        logger.info(f"FileUpload.save called for file_id={self.id if self.id else 'NEW'}")
        if not self.file_name and self.file:
            self.file_name = os.path.basename(self.file.name)
        if not self.file_size and self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs) 
        logger.info(f"FileUpload saved successfully: {self}") 
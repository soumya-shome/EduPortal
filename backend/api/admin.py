from django.contrib import admin
from django.utils.html import format_html
from .models import (
    User, Course, WeeklyDetail, Enrollment, StudyMaterial, Exam, Question,
    QuestionOption, ExamAttempt, Answer, FeeTransaction, TeacherSalary, StudentProgress
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'full_name', 'email', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('username', 'email', 'first_name', 'last_name', 'role')
        }),
        ('Contact Information', {
            'fields': ('phone', 'address', 'date_of_birth')
        }),
        ('Profile', {
            'fields': ('profile_picture', 'bio', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'teacher', 'difficulty_level', 'fee', 'enrolled_students_count', 'is_active']
    list_filter = ['difficulty_level', 'is_active', 'created_at', 'teacher']
    search_fields = ['title', 'description', 'teacher__username']
    readonly_fields = ['created_at', 'updated_at', 'enrolled_students_count']
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'teacher', 'difficulty_level')
        }),
        ('Course Details', {
            'fields': ('duration_weeks', 'fee', 'max_students', 'syllabus', 'prerequisites')
        }),
        ('Media', {
            'fields': ('thumbnail',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WeeklyDetail)
class WeeklyDetailAdmin(admin.ModelAdmin):
    list_display = ['course', 'week_number', 'title', 'created_at']
    list_filter = ['course', 'week_number', 'created_at']
    search_fields = ['title', 'description', 'course__title']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['course', 'week_number']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'completion_percentage', 'is_active', 'enrolled_at']
    list_filter = ['is_active', 'enrolled_at', 'course', 'student__role']
    search_fields = ['student__username', 'course__title']
    readonly_fields = ['enrolled_at', 'completed_at']
    fieldsets = (
        ('Enrollment Details', {
            'fields': ('student', 'course', 'is_active')
        }),
        ('Progress', {
            'fields': ('completion_percentage', 'rating', 'review')
        }),
        ('Timestamps', {
            'fields': ('enrolled_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StudyMaterial)
class StudyMaterialAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'material_type', 'uploaded_by', 'is_public', 'created_at']
    list_filter = ['material_type', 'is_public', 'created_at', 'course']
    search_fields = ['title', 'description', 'course__title', 'uploaded_by__username']
    readonly_fields = ['uploaded_by', 'created_at', 'updated_at']
    fieldsets = (
        ('Material Information', {
            'fields': ('title', 'description', 'course', 'material_type')
        }),
        ('Content', {
            'fields': ('file', 'file_url', 'week_number')
        }),
        ('Settings', {
            'fields': ('is_public', 'uploaded_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'total_marks', 'passing_marks', 'is_active', 'created_by']
    list_filter = ['is_active', 'created_at', 'course', 'created_by']
    search_fields = ['title', 'description', 'course__title']
    readonly_fields = ['created_by', 'created_at', 'updated_at']
    fieldsets = (
        ('Exam Information', {
            'fields': ('title', 'description', 'course', 'created_by')
        }),
        ('Settings', {
            'fields': ('duration_minutes', 'total_marks', 'passing_marks', 'is_active')
        }),
        ('Schedule', {
            'fields': ('start_time', 'end_time')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'exam', 'question_type', 'marks', 'order']
    list_filter = ['question_type', 'exam', 'created_at']
    search_fields = ['question_text', 'exam__title']
    readonly_fields = ['created_at']
    ordering = ['exam', 'order']


@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ['option_text', 'question', 'is_correct', 'order']
    list_filter = ['is_correct', 'question__exam']
    search_fields = ['option_text', 'question__question_text']
    ordering = ['question', 'order']


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'exam', 'score', 'is_passed', 'started_at', 'completed_at']
    list_filter = ['is_passed', 'started_at', 'exam', 'student__role']
    search_fields = ['student__username', 'exam__title']
    readonly_fields = ['started_at', 'completed_at']
    fieldsets = (
        ('Attempt Details', {
            'fields': ('student', 'exam', 'is_passed')
        }),
        ('Results', {
            'fields': ('score', 'time_taken_minutes')
        }),
        ('Timestamps', {
            'fields': ('started_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['exam_attempt', 'question', 'marks_obtained', 'is_correct']
    list_filter = ['is_correct', 'question__question_type']
    search_fields = ['question__question_text', 'exam_attempt__student__username']


@admin.register(FeeTransaction)
class FeeTransactionAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'transaction_type', 'amount', 'payment_status', 'transaction_date']
    list_filter = ['transaction_type', 'payment_status', 'payment_method', 'transaction_date']
    search_fields = ['student__username', 'course__title', 'transaction_id']
    readonly_fields = ['transaction_date']
    fieldsets = (
        ('Transaction Details', {
            'fields': ('student', 'course', 'transaction_type', 'amount')
        }),
        ('Payment Information', {
            'fields': ('payment_status', 'payment_method', 'transaction_id')
        }),
        ('Additional Information', {
            'fields': ('description',)
        }),
        ('Timestamps', {
            'fields': ('transaction_date',),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherSalary)
class TeacherSalaryAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'month', 'base_salary', 'total_salary', 'payment_status', 'payment_date']
    list_filter = ['payment_status', 'month', 'teacher']
    search_fields = ['teacher__username', 'teacher__first_name', 'teacher__last_name']
    readonly_fields = ['total_salary', 'created_at', 'updated_at']
    fieldsets = (
        ('Salary Information', {
            'fields': ('teacher', 'month', 'base_salary', 'bonus', 'deductions')
        }),
        ('Payment Details', {
            'fields': ('payment_status', 'payment_date', 'payment_method')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Calculated Fields', {
            'fields': ('total_salary',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'week_number', 'overall_score', 'attendance_percentage']
    list_filter = ['week_number', 'course', 'student__role']
    search_fields = ['student__username', 'course__title']
    readonly_fields = ['overall_score', 'created_at', 'updated_at']
    fieldsets = (
        ('Progress Information', {
            'fields': ('student', 'course', 'week_number')
        }),
        ('Scores', {
            'fields': ('attendance_percentage', 'assignment_score', 'quiz_score', 'participation_score')
        }),
        ('Additional Information', {
            'fields': ('teacher_notes',)
        }),
        ('Calculated Fields', {
            'fields': ('overall_score',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 
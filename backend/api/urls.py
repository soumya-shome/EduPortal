from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, UserViewSet, CourseViewSet, WeeklyDetailViewSet, EnrollmentViewSet,
    StudyMaterialViewSet, ExamViewSet, QuestionViewSet, QuestionOptionViewSet,
    ExamAttemptViewSet, FeeTransactionViewSet, TeacherSalaryViewSet, StudentProgressViewSet,
    AdminViewSet, FileUploadViewSet
)

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'weekly-details', WeeklyDetailViewSet, basename='weekly-detail')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'study-materials', StudyMaterialViewSet, basename='study-material')
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'question-options', QuestionOptionViewSet, basename='question-option')
router.register(r'exam-attempts', ExamAttemptViewSet, basename='exam-attempt')
router.register(r'fee-transactions', FeeTransactionViewSet, basename='fee-transaction')
router.register(r'teacher-salaries', TeacherSalaryViewSet, basename='teacher-salary')
router.register(r'student-progress', StudentProgressViewSet, basename='student-progress')
router.register(r'file-uploads', FileUploadViewSet, basename='file-upload')
router.register(r'admin', AdminViewSet, basename='admin')

urlpatterns = [
    path('', include(router.urls)),
] 
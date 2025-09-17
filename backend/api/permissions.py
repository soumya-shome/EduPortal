import logging
from rest_framework import permissions
from rest_framework.permissions import BasePermission

# Get logger for permissions
logger = logging.getLogger('api.permissions')


class IsTeacherOrAdmin(BasePermission):
    """
    Custom permission to allow only teachers and admins.
    """
    
    def has_permission(self, request, view):
        logger.debug(f"IsTeacherOrAdmin.has_permission called for user: {request.user.username}")
        logger.debug(f"User role: {request.user.role}, Is authenticated: {request.user.is_authenticated}")
        
        if not request.user.is_authenticated:
            logger.warning(f"Permission denied - user not authenticated: {request.user}")
            return False
        
        has_permission = request.user.role in ['teacher', 'admin']
        logger.info(f"Permission {'granted' if has_permission else 'denied'} for user {request.user.username} (role: {request.user.role})")
        return has_permission


class IsEnrolledStudentOrTeacher(BasePermission):
    """
    Custom permission to allow enrolled students and teachers.
    """
    
    def has_permission(self, request, view):
        logger.debug(f"IsEnrolledStudentOrTeacher.has_permission called for user: {request.user.username}")
        logger.debug(f"User role: {request.user.role}, Is authenticated: {request.user.is_authenticated}")
        
        if not request.user.is_authenticated:
            logger.warning(f"Permission denied - user not authenticated: {request.user}")
            return False
        
        has_permission = request.user.role in ['student', 'teacher', 'admin']
        logger.info(f"Permission {'granted' if has_permission else 'denied'} for user {request.user.username} (role: {request.user.role})")
        return has_permission


class IsCourseTeacherOrAdmin(BasePermission):
    """
    Custom permission to allow only the course teacher or admin.
    """
    
    def has_permission(self, request, view):
        logger.debug(f"IsCourseTeacherOrAdmin.has_permission called for user: {request.user.username}")
        logger.debug(f"User role: {request.user.role}, Is authenticated: {request.user.is_authenticated}")
        
        if not request.user.is_authenticated:
            logger.warning(f"Permission denied - user not authenticated: {request.user}")
            return False
        
        has_permission = request.user.role in ['teacher', 'admin']
        logger.info(f"Permission {'granted' if has_permission else 'denied'} for user {request.user.username} (role: {request.user.role})")
        return has_permission
    
    def has_object_permission(self, request, view, obj):
        logger.debug(f"IsCourseTeacherOrAdmin.has_object_permission called for user: {request.user.username}")
        logger.debug(f"Object type: {type(obj).__name__}, Object ID: {obj.id}")
        
        if request.user.role == 'admin':
            logger.info(f"Admin permission granted for user {request.user.username}")
            return True
        
        if request.user.role == 'teacher':
            # Check if the user is the teacher of the course
            if hasattr(obj, 'course'):
                course = obj.course
            elif hasattr(obj, 'teacher'):
                course = obj
            else:
                logger.warning(f"Object does not have course or teacher attribute: {obj}")
                return False
            
            is_teacher = course.teacher == request.user
            logger.info(f"Teacher permission {'granted' if is_teacher else 'denied'} for user {request.user.username} on course {course.title}")
            return is_teacher
        
        logger.warning(f"Permission denied for user {request.user.username} (role: {request.user.role})")
        return False


class IsOwnerOrAdmin(BasePermission):
    """
    Custom permission to allow only the object owner or admin.
    """
    
    def has_permission(self, request, view):
        logger.debug(f"IsOwnerOrAdmin.has_permission called for user: {request.user.username}")
        logger.debug(f"User role: {request.user.role}, Is authenticated: {request.user.is_authenticated}")
        
        if not request.user.is_authenticated:
            logger.warning(f"Permission denied - user not authenticated: {request.user}")
            return False
        
        has_permission = request.user.role in ['student', 'teacher', 'admin']
        logger.info(f"Permission {'granted' if has_permission else 'denied'} for user {request.user.username} (role: {request.user.role})")
        return has_permission
    
    def has_object_permission(self, request, view, obj):
        logger.debug(f"IsOwnerOrAdmin.has_object_permission called for user: {request.user.username}")
        logger.debug(f"Object type: {type(obj).__name__}, Object ID: {obj.id}")
        
        if request.user.role == 'admin':
            logger.info(f"Admin permission granted for user {request.user.username}")
            return True
        
        # Check if the user is the owner of the object
        if hasattr(obj, 'user'):
            owner = obj.user
        elif hasattr(obj, 'student'):
            owner = obj.student
        elif hasattr(obj, 'teacher'):
            owner = obj.teacher
        elif hasattr(obj, 'created_by'):
            owner = obj.created_by
        elif hasattr(obj, 'uploaded_by'):
            owner = obj.uploaded_by
        else:
            logger.warning(f"Object does not have user, student, teacher, created_by, or uploaded_by attribute: {obj}")
            return False
        
        is_owner = owner == request.user
        logger.info(f"Owner permission {'granted' if is_owner else 'denied'} for user {request.user.username} on object {obj}")
        return is_owner


class IsStudentUser(BasePermission):
    """
    Custom permission to allow only students.
    """
    
    def has_permission(self, request, view):
        logger.debug(f"IsStudentUser.has_permission called for user: {request.user.username}")
        logger.debug(f"User role: {request.user.role}, Is authenticated: {request.user.is_authenticated}")
        
        if not request.user.is_authenticated:
            logger.warning(f"Permission denied - user not authenticated: {request.user}")
            return False
        
        has_permission = request.user.role == 'student'
        logger.info(f"Permission {'granted' if has_permission else 'denied'} for user {request.user.username} (role: {request.user.role})")
        return has_permission


class IsTeacherUser(BasePermission):
    """
    Custom permission to allow only teachers.
    """
    
    def has_permission(self, request, view):
        logger.debug(f"IsTeacherUser.has_permission called for user: {request.user.username}")
        logger.debug(f"User role: {request.user.role}, Is authenticated: {request.user.is_authenticated}")
        
        if not request.user.is_authenticated:
            logger.warning(f"Permission denied - user not authenticated: {request.user}")
            return False
        
        has_permission = request.user.role == 'teacher'
        logger.info(f"Permission {'granted' if has_permission else 'denied'} for user {request.user.username} (role: {request.user.role})")
        return has_permission


class IsAdminUser(BasePermission):
    """
    Custom permission to allow only admins.
    """
    
    def has_permission(self, request, view):
        logger.debug(f"IsAdminUser.has_permission called for user: {request.user.username}")
        logger.debug(f"User role: {request.user.role}, Is authenticated: {request.user.is_authenticated}")
        
        if not request.user.is_authenticated:
            logger.warning(f"Permission denied - user not authenticated: {request.user}")
            return False
        
        has_permission = request.user.role == 'admin'
        logger.info(f"Permission {'granted' if has_permission else 'denied'} for user {request.user.username} (role: {request.user.role})")
        return has_permission


class IsEnrolledStudent(BasePermission):
    """
    Custom permission to allow only enrolled students.
    """
    
    def has_permission(self, request, view):
        logger.debug(f"IsEnrolledStudent.has_permission called for user: {request.user.username}")
        logger.debug(f"User role: {request.user.role}, Is authenticated: {request.user.is_authenticated}")
        
        if not request.user.is_authenticated:
            logger.warning(f"Permission denied - user not authenticated: {request.user}")
            return False
        
        has_permission = request.user.role == 'student'
        logger.info(f"Permission {'granted' if has_permission else 'denied'} for user {request.user.username} (role: {request.user.role})")
        return has_permission
    
    def has_object_permission(self, request, view, obj):
        logger.debug(f"IsEnrolledStudent.has_object_permission called for user: {request.user.username}")
        logger.debug(f"Object type: {type(obj).__name__}, Object ID: {obj.id}")
        
        if request.user.role != 'student':
            logger.warning(f"Permission denied - user is not a student: {request.user.username}")
            return False
        
        # Check if the student is enrolled in the course
        if hasattr(obj, 'course'):
            course = obj.course
        else:
            logger.warning(f"Object does not have course attribute: {obj}")
            return False
        
        is_enrolled = course.enrollments.filter(student=request.user, is_active=True).exists()
        logger.info(f"Enrollment permission {'granted' if is_enrolled else 'denied'} for student {request.user.username} on course {course.title}")
        return is_enrolled


class IsCourseTeacher(BasePermission):
    """
    Custom permission to allow only the course teacher.
    """
    
    def has_permission(self, request, view):
        logger.debug(f"IsCourseTeacher.has_permission called for user: {request.user.username}")
        logger.debug(f"User role: {request.user.role}, Is authenticated: {request.user.is_authenticated}")
        
        if not request.user.is_authenticated:
            logger.warning(f"Permission denied - user not authenticated: {request.user}")
            return False
        
        has_permission = request.user.role == 'teacher'
        logger.info(f"Permission {'granted' if has_permission else 'denied'} for user {request.user.username} (role: {request.user.role})")
        return has_permission
    
    def has_object_permission(self, request, view, obj):
        logger.debug(f"IsCourseTeacher.has_object_permission called for user: {request.user.username}")
        logger.debug(f"Object type: {type(obj).__name__}, Object ID: {obj.id}")
        
        if request.user.role != 'teacher':
            logger.warning(f"Permission denied - user is not a teacher: {request.user.username}")
            return False
        
        # Check if the user is the teacher of the course
        if hasattr(obj, 'course'):
            course = obj.course
        elif hasattr(obj, 'teacher'):
            course = obj
        else:
            logger.warning(f"Object does not have course or teacher attribute: {obj}")
            return False
        
        is_teacher = course.teacher == request.user
        logger.info(f"Teacher permission {'granted' if is_teacher else 'denied'} for user {request.user.username} on course {course.title}")
        return is_teacher 
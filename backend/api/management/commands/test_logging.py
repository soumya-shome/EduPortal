import logging
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Course, User, Enrollment

User = get_user_model()
logger = logging.getLogger('api.test_logging')


class Command(BaseCommand):
    help = 'Test the logging functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--level',
            type=str,
            default='info',
            choices=['debug', 'info', 'warning', 'error'],
            help='Log level to test'
        )
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of test operations to perform'
        )

    def handle(self, *args, **options):
        level = options['level']
        count = options['count']
        
        logger.info("=== LOGGING TEST START ===")
        logger.info(f"Testing logging at level: {level}")
        logger.info(f"Number of test operations: {count}")
        
        # Test different log levels
        if level == 'debug':
            self.test_debug_logging(count)
        elif level == 'info':
            self.test_info_logging(count)
        elif level == 'warning':
            self.test_warning_logging(count)
        elif level == 'error':
            self.test_error_logging(count)
        
        logger.info("=== LOGGING TEST END ===")
        self.stdout.write(
            self.style.SUCCESS(f'Successfully completed logging test with {count} operations')
        )

    def test_debug_logging(self, count):
        """Test debug level logging."""
        logger.debug("Starting debug logging test")
        
        for i in range(count):
            logger.debug(f"Debug message {i+1}: Testing debug level logging")
            
            # Simulate some operations
            try:
                users = User.objects.all()[:5]
                logger.debug(f"Retrieved {len(users)} users")
                
                courses = Course.objects.all()[:3]
                logger.debug(f"Retrieved {len(courses)} courses")
                
            except Exception as e:
                logger.debug(f"Debug operation {i+1} encountered issue: {str(e)}")

    def test_info_logging(self, count):
        """Test info level logging."""
        logger.info("Starting info logging test")
        
        for i in range(count):
            logger.info(f"Info message {i+1}: Testing info level logging")
            
            # Simulate some operations
            try:
                total_users = User.objects.count()
                logger.info(f"Total users in system: {total_users}")
                
                total_courses = Course.objects.count()
                logger.info(f"Total courses in system: {total_courses}")
                
                active_enrollments = Enrollment.objects.filter(is_active=True).count()
                logger.info(f"Active enrollments: {active_enrollments}")
                
            except Exception as e:
                logger.info(f"Info operation {i+1} encountered issue: {str(e)}")

    def test_warning_logging(self, count):
        """Test warning level logging."""
        logger.warning("Starting warning logging test")
        
        for i in range(count):
            logger.warning(f"Warning message {i+1}: Testing warning level logging")
            
            # Simulate some operations that might generate warnings
            try:
                # Check for potential issues
                inactive_users = User.objects.filter(is_active=False).count()
                if inactive_users > 0:
                    logger.warning(f"Found {inactive_users} inactive users")
                
                courses_without_teacher = Course.objects.filter(teacher__isnull=True).count()
                if courses_without_teacher > 0:
                    logger.warning(f"Found {courses_without_teacher} courses without teachers")
                
                enrollments_without_course = Enrollment.objects.filter(course__isnull=True).count()
                if enrollments_without_course > 0:
                    logger.warning(f"Found {enrollments_without_course} enrollments without courses")
                
            except Exception as e:
                logger.warning(f"Warning operation {i+1} encountered issue: {str(e)}")

    def test_error_logging(self, count):
        """Test error level logging."""
        logger.error("Starting error logging test")
        
        for i in range(count):
            logger.error(f"Error message {i+1}: Testing error level logging")
            
            # Simulate some operations that might generate errors
            try:
                # Try to access non-existent objects
                non_existent_user = User.objects.get(id=99999)
                logger.error("This should not happen - found non-existent user")
                
            except User.DoesNotExist:
                logger.error(f"Expected error {i+1}: User with ID 99999 does not exist")
            
            try:
                # Try to access non-existent course
                non_existent_course = Course.objects.get(id=99999)
                logger.error("This should not happen - found non-existent course")
                
            except Course.DoesNotExist:
                logger.error(f"Expected error {i+1}: Course with ID 99999 does not exist")
            
            try:
                # Try to access non-existent enrollment
                non_existent_enrollment = Enrollment.objects.get(id=99999)
                logger.error("This should not happen - found non-existent enrollment")
                
            except Enrollment.DoesNotExist:
                logger.error(f"Expected error {i+1}: Enrollment with ID 99999 does not exist")

    def test_model_operations(self):
        """Test logging in model operations."""
        logger.info("Testing model operation logging")
        
        try:
            # Test user creation logging
            test_user = User.objects.create_user(
                username='test_logging_user',
                email='test@logging.com',
                password='testpass123',
                role='student'
            )
            logger.info(f"Created test user: {test_user.username}")
            
            # Test course creation logging
            test_course = Course.objects.create(
                title='Test Logging Course',
                description='A course to test logging functionality',
                teacher=test_user,
                difficulty_level='beginner',
                fee=100.00
            )
            logger.info(f"Created test course: {test_user.title}")
            
            # Test enrollment creation logging
            test_enrollment = Enrollment.objects.create(
                student=test_user,
                course=test_course
            )
            logger.info(f"Created test enrollment: {test_enrollment}")
            
            # Clean up test data
            test_enrollment.delete()
            test_course.delete()
            test_user.delete()
            logger.info("Cleaned up test data")
            
        except Exception as e:
            logger.error(f"Error during model operation test: {str(e)}")

    def test_performance_logging(self):
        """Test performance logging."""
        logger.info("Testing performance logging")
        
        import time
        
        # Test database query performance
        start_time = time.time()
        users = User.objects.all()
        query_time = time.time() - start_time
        logger.info(f"Database query took {query_time:.3f} seconds")
        
        # Test slow operation
        start_time = time.time()
        time.sleep(0.5)  # Simulate slow operation
        operation_time = time.time() - start_time
        logger.info(f"Slow operation took {operation_time:.3f} seconds")
        
        # Test very slow operation (should trigger warning)
        start_time = time.time()
        time.sleep(1.5)  # Simulate very slow operation
        slow_operation_time = time.time() - start_time
        logger.warning(f"Very slow operation took {slow_operation_time:.3f} seconds") 
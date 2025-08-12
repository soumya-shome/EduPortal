from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from api.models import User, Course, Enrollment, StudyMaterial, Exam, Question, QuestionOption, FeeTransaction
import random


class Command(BaseCommand):
    help = 'Populate the database with sample data for demonstration'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Check if admin user already exists
        if User.objects.filter(username='admin').exists():
            self.stdout.write('Admin user already exists, skipping...')
            admin_user = User.objects.get(username='admin')
        else:
            # Create admin user
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@eduportal.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='admin',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write('Created admin user')

        # Check if teachers already exist
        if User.objects.filter(username='teacher1').exists():
            self.stdout.write('Teacher users already exist, skipping...')
            teacher1 = User.objects.get(username='teacher1')
            teacher2 = User.objects.get(username='teacher2')
        else:
            # Create teachers
            teacher1 = User.objects.create_user(
                username='teacher1',
                email='teacher1@eduportal.com',
                password='teacher123',
                first_name='John',
                last_name='Smith',
                role='teacher',
                phone='+1234567890',
                address='123 Teacher Street, Education City'
            )

            teacher2 = User.objects.create_user(
                username='teacher2',
                email='teacher2@eduportal.com',
                password='teacher123',
                first_name='Sarah',
                last_name='Johnson',
                role='teacher',
                phone='+1234567891',
                address='456 Instructor Avenue, Learning Town'
            )
            self.stdout.write('Created teacher users')

        # Check if students already exist
        existing_students = User.objects.filter(role='student').count()
        if existing_students >= 10:
            self.stdout.write('Student users already exist, skipping...')
            students = list(User.objects.filter(role='student')[:10])
        else:
            # Create students
            students = []
            student_names = [
                ('Alice', 'Brown'),
                ('Bob', 'Wilson'),
                ('Carol', 'Davis'),
                ('David', 'Miller'),
                ('Eva', 'Garcia'),
                ('Frank', 'Martinez'),
                ('Grace', 'Anderson'),
                ('Henry', 'Taylor'),
                ('Ivy', 'Thomas'),
                ('Jack', 'Hernandez')
            ]

            for i, (first_name, last_name) in enumerate(student_names, 1):
                username = f'student{i}'
                if not User.objects.filter(username=username).exists():
                    student = User.objects.create_user(
                        username=username,
                        email=f'student{i}@eduportal.com',
                        password='student123',
                        first_name=first_name,
                        last_name=last_name,
                        role='student',
                        phone=f'+12345678{i:02d}',
                        address=f'{i}00 Student Street, Learning City'
                    )
                    students.append(student)
                else:
                    students.append(User.objects.get(username=username))
            self.stdout.write('Created student users')

        # Check if courses already exist
        if Course.objects.exists():
            self.stdout.write('Courses already exist, skipping...')
            courses = list(Course.objects.all())
        else:
            # Create courses
            courses_data = [
                {
                    'title': 'Introduction to Python Programming',
                    'description': 'Learn the fundamentals of Python programming language. This course covers basic syntax, data structures, and object-oriented programming concepts.',
                    'teacher': teacher1,
                    'difficulty_level': 'beginner',
                    'duration_weeks': 8,
                    'fee': 299.99
                },
                {
                    'title': 'Advanced Web Development',
                    'description': 'Master modern web development techniques including React, Node.js, and database design. Build full-stack applications from scratch.',
                    'teacher': teacher1,
                    'difficulty_level': 'advanced',
                    'duration_weeks': 12,
                    'fee': 499.99
                },
                {
                    'title': 'Data Science Fundamentals',
                    'description': 'Introduction to data science concepts, statistical analysis, and machine learning algorithms using Python and popular libraries.',
                    'teacher': teacher2,
                    'difficulty_level': 'intermediate',
                    'duration_weeks': 10,
                    'fee': 399.99
                },
                {
                    'title': 'Digital Marketing Strategy',
                    'description': 'Learn modern digital marketing techniques including SEO, social media marketing, and content strategy for business growth.',
                    'teacher': teacher2,
                    'difficulty_level': 'beginner',
                    'duration_weeks': 6,
                    'fee': 249.99
                },
                {
                    'title': 'Mobile App Development',
                    'description': 'Develop mobile applications for iOS and Android using React Native and modern development practices.',
                    'teacher': teacher1,
                    'difficulty_level': 'intermediate',
                    'duration_weeks': 14,
                    'fee': 599.99
                }
            ]

            courses = []
            for course_data in courses_data:
                course = Course.objects.create(**course_data)
                courses.append(course)
            self.stdout.write('Created courses')

        # Create enrollments if they don't exist
        if not Enrollment.objects.exists():
            for course in courses:
                # Enroll 3-7 students in each course
                num_students = random.randint(3, 7)
                selected_students = random.sample(students, num_students)
                
                for student in selected_students:
                    enrollment = Enrollment.objects.create(
                        student=student,
                        course=course,
                        completion_percentage=random.randint(0, 100)
                    )
            self.stdout.write('Created enrollments')

        # Create study materials if they don't exist
        if not StudyMaterial.objects.exists():
            materials_data = [
                {
                    'title': 'Python Basics - Chapter 1',
                    'description': 'Introduction to Python syntax and basic concepts',
                    'material_type': 'document'
                },
                {
                    'title': 'Web Development Best Practices',
                    'description': 'Guidelines for building scalable web applications',
                    'material_type': 'document'
                },
                {
                    'title': 'Data Analysis Tutorial',
                    'description': 'Step-by-step guide to data analysis with Python',
                    'material_type': 'video'
                },
                {
                    'title': 'Marketing Case Studies',
                    'description': 'Real-world examples of successful marketing campaigns',
                    'material_type': 'document'
                },
                {
                    'title': 'Mobile App Design Principles',
                    'description': 'UI/UX guidelines for mobile application design',
                    'material_type': 'link'
                }
            ]

            for i, material_data in enumerate(materials_data):
                course = courses[i % len(courses)]
                StudyMaterial.objects.create(
                    course=course,
                    uploaded_by=course.teacher,
                    **material_data
                )
            self.stdout.write('Created study materials')

        # Create exams if they don't exist
        if not Exam.objects.exists():
            for course in courses:
                exam = Exam.objects.create(
                    title=f'{course.title} - Final Exam',
                    description=f'Comprehensive exam covering all topics from {course.title}',
                    course=course,
                    duration_minutes=60,
                    total_marks=100,
                    passing_marks=40,
                    start_time=timezone.now() + timedelta(days=7),
                    end_time=timezone.now() + timedelta(days=14),
                    created_by=course.teacher
                )

                # Create questions for each exam
                questions_data = [
                    {
                        'question_text': 'What is the primary purpose of this course?',
                        'question_type': 'multiple_choice',
                        'marks': 10
                    },
                    {
                        'question_text': 'Explain the key concepts covered in this course.',
                        'question_type': 'essay',
                        'marks': 20
                    },
                    {
                        'question_text': 'Which of the following is NOT a valid answer?',
                        'question_type': 'multiple_choice',
                        'marks': 10
                    }
                ]

                for i, question_data in enumerate(questions_data):
                    question = Question.objects.create(
                        exam=exam,
                        order=i + 1,
                        **question_data
                    )

                    # Create options for multiple choice questions
                    if question.question_type == 'multiple_choice':
                        options_data = [
                            ('Option A - Correct answer', True),
                            ('Option B - Incorrect answer', False),
                            ('Option C - Incorrect answer', False),
                            ('Option D - Incorrect answer', False)
                        ]
                        
                        for j, (option_text, is_correct) in enumerate(options_data):
                            QuestionOption.objects.create(
                                question=question,
                                option_text=option_text,
                                is_correct=is_correct,
                                order=j + 1
                            )
            self.stdout.write('Created exams')

        # Create fee transactions if they don't exist
        if not FeeTransaction.objects.exists():
            for enrollment in Enrollment.objects.all():
                FeeTransaction.objects.create(
                    student=enrollment.student,
                    course=enrollment.course,
                    transaction_type='course',
                    amount=enrollment.course.fee,
                    payment_status='completed',
                    payment_method='credit_card',
                    description=f'Payment for {enrollment.course.title}'
                )
            self.stdout.write('Created fee transactions')

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )
        self.stdout.write(f'Created:')
        self.stdout.write(f'- 1 Admin user (admin/admin123)')
        self.stdout.write(f'- 2 Teachers (teacher1/teacher123, teacher2/teacher123)')
        self.stdout.write(f'- 10 Students (student1/student123 to student10/student123)')
        self.stdout.write(f'- 5 Courses')
        self.stdout.write(f'- Multiple enrollments')
        self.stdout.write(f'- Study materials')
        self.stdout.write(f'- Exams with questions')
        self.stdout.write(f'- Fee transactions') 
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import User

class Command(BaseCommand):
    help = 'Fix admin roles for superusers and create admin users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-admin',
            action='store_true',
            help='Create a new admin user',
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Username for new admin user',
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Email for new admin user',
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Password for new admin user',
        )

    def handle(self, *args, **options):
        # Fix existing superusers to have admin role
        superusers = User.objects.filter(is_superuser=True)
        updated_count = 0
        
        for user in superusers:
            if user.role != 'admin':
                user.role = 'admin'
                user.save()
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Updated superuser {user.username} to admin role')
                )
        
        if updated_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'Updated {updated_count} superusers to admin role')
            )
        else:
            self.stdout.write(
                self.style.WARNING('No superusers needed role updates')
            )

        # Create new admin user if requested
        if options['create_admin']:
            username = options['username']
            email = options['email']
            password = options['password']
            
            if not all([username, email, password]):
                self.stdout.write(
                    self.style.ERROR('Please provide username, email, and password for new admin user')
                )
                return
            
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.ERROR(f'User with username {username} already exists')
                )
                return
            
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.ERROR(f'User with email {email} already exists')
                )
                return
            
            # Create admin user
            admin_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='admin',
                is_staff=True,
                is_superuser=True,
                first_name='Admin',
                last_name='User'
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Created admin user: {username}')
            )

        # Show current admin users
        admin_users = User.objects.filter(role='admin')
        self.stdout.write(
            self.style.SUCCESS(f'Current admin users: {admin_users.count()}')
        )
        for user in admin_users:
            self.stdout.write(f'  - {user.username} ({user.email}) - Superuser: {user.is_superuser}') 
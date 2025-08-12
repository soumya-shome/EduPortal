#!/usr/bin/env python
"""
Script to run migrations and fix database issues.
Run this script from the backend directory.
"""

import os
import sys
import django

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduportal.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def run_migrations():
    """Run all pending migrations."""
    print("Running migrations...")
    try:
        # Run makemigrations first
        execute_from_command_line(['manage.py', 'makemigrations'])
        print("✓ Makemigrations completed")
        
        # Run migrate
        execute_from_command_line(['manage.py', 'migrate'])
        print("✓ Migrations completed")
        
        return True
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

def check_database():
    """Check if the database is properly set up."""
    print("Checking database...")
    try:
        with connection.cursor() as cursor:
            # Check if file_uploads table exists
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='file_uploads';
            """)
            result = cursor.fetchone()
            
            if result:
                print("✓ file_uploads table exists")
                return True
            else:
                print("❌ file_uploads table does not exist")
                return False
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return False

def main():
    """Main function."""
    print("=== Database Migration Script ===")
    
    # Run migrations
    if run_migrations():
        print("\n=== Migration Results ===")
        
        # Check database
        if check_database():
            print("\n✅ All migrations completed successfully!")
            print("The database is now properly set up.")
        else:
            print("\n❌ Database check failed.")
            print("Please run 'python manage.py migrate' manually.")
    else:
        print("\n❌ Migration failed.")
        print("Please check the error messages above.")

if __name__ == '__main__':
    main() 
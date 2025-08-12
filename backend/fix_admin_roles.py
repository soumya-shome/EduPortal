#!/usr/bin/env python
"""
Script to fix admin roles for existing superusers.
Run this script to update existing superusers to have the admin role.
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduportal.settings')
django.setup()

from api.models import User

def fix_admin_roles():
    """Fix admin roles for existing superusers."""
    print("Fixing admin roles for superusers...")
    
    # Get all superusers
    superusers = User.objects.filter(is_superuser=True)
    updated_count = 0
    
    for user in superusers:
        if user.role != 'admin':
            user.role = 'admin'
            user.save()
            updated_count += 1
            print(f"Updated superuser {user.username} to admin role")
    
    if updated_count > 0:
        print(f"\nUpdated {updated_count} superusers to admin role")
    else:
        print("\nNo superusers needed role updates")
    
    # Show current admin users
    admin_users = User.objects.filter(role='admin')
    print(f"\nCurrent admin users: {admin_users.count()}")
    for user in admin_users:
        print(f"  - {user.username} ({user.email}) - Superuser: {user.is_superuser}")

if __name__ == '__main__':
    fix_admin_roles() 
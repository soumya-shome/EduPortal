#!/usr/bin/env python3
"""
Setup script for Education Center Portal
This script helps with initial project configuration and database setup.
"""

import os
import sys
import subprocess
import secrets
from pathlib import Path

def run_command(command, cwd=None):
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True, cwd=cwd)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error: {e.stderr}")
        return None

def create_env_file():
    """Create .env file with default configuration."""
    env_content = f"""SECRET_KEY={secrets.token_urlsafe(50)}
DEBUG=True
DB_NAME=eduportal
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
"""
    
    env_path = Path("backend/.env")
    if not env_path.exists():
        with open(env_path, "w") as f:
            f.write(env_content)
        print("✅ Created .env file with default configuration")
    else:
        print("ℹ️  .env file already exists")

def check_dependencies():
    """Check if required dependencies are installed."""
    print("🔍 Checking dependencies...")
    
    # Check Python
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Check Node.js
    node_result = run_command("node --version")
    if node_result:
        print(f"✅ Node.js {node_result}")
    else:
        print("❌ Node.js is required")
        return False
    
    # Check npm
    npm_result = run_command("npm --version")
    if npm_result:
        print(f"✅ npm {npm_result}")
    else:
        print("❌ npm is required")
        return False
    
    return True

def setup_backend():
    """Set up the Django backend."""
    print("\n🔧 Setting up Django backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Install Python dependencies
    print("📦 Installing Python dependencies...")
    result = run_command("pip install -r requirements.txt", cwd=".")
    if not result:
        print("❌ Failed to install Python dependencies")
        return False
    
    # Create migrations
    print("🗄️  Creating database migrations...")
    result = run_command("python manage.py makemigrations", cwd="backend")
    if not result:
        print("❌ Failed to create migrations")
        return False
    
    # Run migrations
    print("🗄️  Running database migrations...")
    result = run_command("python manage.py migrate", cwd="backend")
    if not result:
        print("❌ Failed to run migrations")
        return False
    
    print("✅ Backend setup completed")
    return True

def setup_frontend():
    """Set up the React frontend."""
    print("\n🔧 Setting up React frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install Node.js dependencies
    print("📦 Installing Node.js dependencies...")
    result = run_command("npm install", cwd="frontend")
    if not result:
        print("❌ Failed to install Node.js dependencies")
        return False
    
    print("✅ Frontend setup completed")
    return True

def create_superuser():
    """Create a Django superuser."""
    print("\n👤 Creating superuser...")
    print("Please enter the following information for the admin user:")
    
    username = input("Username: ").strip()
    email = input("Email: ").strip()
    
    # Create superuser command
    command = f"python manage.py createsuperuser --username {username} --email {email} --noinput"
    result = run_command(command, cwd="backend")
    
    if result:
        print("✅ Superuser created successfully")
        print(f"Username: {username}")
        print("Password: You can set it using 'python manage.py changepassword'")
    else:
        print("❌ Failed to create superuser")

def main():
    """Main setup function."""
    print("🚀 Education Center Portal Setup")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Setup failed: Missing dependencies")
        return
    
    # Create .env file
    create_env_file()
    
    # Setup backend
    if not setup_backend():
        print("\n❌ Setup failed: Backend setup failed")
        return
    
    # Setup frontend
    if not setup_frontend():
        print("\n❌ Setup failed: Frontend setup failed")
        return
    
    # Create superuser
    create_superuser()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the backend server: cd backend && python manage.py runserver")
    print("2. Start the frontend server: cd frontend && npm start")
    print("3. Access the application at http://localhost:3000")
    print("4. Access the admin interface at http://localhost:8000/admin")

if __name__ == "__main__":
    main() 
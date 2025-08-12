# EduPortal - Advanced Learning Management System

A comprehensive Learning Management System (LMS) built with Django REST Framework backend and React frontend, featuring role-based access control with enhanced admin privileges.

## 🚀 Features

### Enhanced Admin Dashboard
The admin dashboard provides comprehensive system control with the following privileges:

#### 📊 **Analytics & Insights**
- **Real-time Statistics**: Live dashboard with user counts, revenue tracking, and course performance
- **Advanced Analytics**: Detailed enrollment trends, revenue analysis, and retention metrics
- **Performance Monitoring**: System health monitoring and uptime tracking
- **Customizable Time Ranges**: Filter data by 7, 30, or 90 days

#### 👥 **User Management**
- **Complete User Control**: Create, edit, and manage all user accounts
- **Role Assignment**: Assign admin, teacher, or student roles
- **Account Status Management**: Activate/deactivate user accounts
- **Bulk Operations**: Perform actions on multiple users simultaneously

#### 📚 **Course Administration**
- **Course Creation & Management**: Full control over course creation and modification
- **Content Management**: Manage study materials, assignments, and resources
- **Enrollment Oversight**: Monitor and manage student enrollments
- **Course Analytics**: Track course performance and student engagement

#### 💰 **Financial Management**
- **Revenue Tracking**: Monitor all financial transactions and revenue streams
- **Fee Management**: Set and manage course fees and payment structures
- **Teacher Salary Management**: Handle teacher compensation and salary processing
- **Financial Reports**: Generate detailed financial reports and analytics

#### 📝 **Exam & Assessment Control**
- **Exam Creation**: Create and manage comprehensive exams
- **Question Bank Management**: Build and maintain question databases
- **Result Analysis**: View detailed exam results and performance metrics
- **Assessment Oversight**: Monitor all assessment activities

#### 🔔 **System Notifications**
- **Notification Management**: Create and send system-wide notifications
- **Targeted Messaging**: Send notifications to specific user groups
- **Notification History**: Track all sent notifications and their status
- **Real-time Alerts**: Monitor system events and send immediate alerts

#### ⚙️ **System Settings**
- **Configuration Management**: Control all system settings and preferences
- **Security Settings**: Manage session timeouts, registration controls, and security policies
- **Backup & Recovery**: Configure backup schedules and system recovery options
- **Maintenance Mode**: Enable/disable system maintenance mode

#### 📈 **Advanced Reporting**
- **Comprehensive Reports**: Generate detailed reports on all system activities
- **Custom Analytics**: Create custom analytics and performance metrics
- **Data Export**: Export data in various formats for external analysis
- **Trend Analysis**: Track long-term trends and patterns

## 🏗️ Architecture

### Backend (Django REST Framework)
- **Models**: Comprehensive data models for users, courses, exams, and financial transactions
- **API Endpoints**: RESTful APIs with role-based permissions
- **Authentication**: JWT-based authentication with role-based access control
- **Admin Views**: Enhanced admin views with additional analytics and management features

### Frontend (React)
- **Component-based Architecture**: Modular, reusable components
- **Role-based Routing**: Different dashboards for admin, teacher, and student roles
- **Real-time Updates**: Live data updates using React Query
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL (recommended) or SQLite

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🔐 Role-Based Access Control

### Admin Privileges
- **Full System Access**: Complete control over all system features
- **User Management**: Create, edit, and manage all user accounts
- **Content Management**: Oversee all courses, materials, and assessments
- **Financial Control**: Manage all financial transactions and settings
- **System Configuration**: Control all system settings and preferences
- **Analytics Access**: View comprehensive analytics and reports
- **Notification Management**: Send system-wide notifications
- **Backup & Recovery**: Manage system backups and recovery

### Teacher Privileges
- **Course Management**: Create and manage their own courses
- **Student Progress**: Track student progress and performance
- **Assessment Creation**: Create exams and assignments
- **Material Upload**: Upload study materials and resources

### Student Privileges
- **Course Enrollment**: Enroll in available courses
- **Material Access**: Access study materials and resources
- **Exam Participation**: Take exams and view results
- **Progress Tracking**: Monitor their own progress

## 📊 Admin Dashboard Features

### Overview Dashboard
- **Real-time Statistics**: Live updates of key metrics
- **Trend Analysis**: Visual representation of growth trends
- **Quick Actions**: Fast access to common admin tasks
- **System Status**: Real-time system health monitoring

### Analytics Dashboard
- **Enrollment Analytics**: Detailed enrollment trends and patterns
- **Revenue Analysis**: Comprehensive financial analytics
- **Performance Metrics**: Course and user performance tracking
- **Custom Reports**: Generate custom analytics reports

### User Management
- **User List**: Complete list of all system users
- **Role Management**: Assign and modify user roles
- **Account Status**: Activate/deactivate user accounts
- **Bulk Operations**: Perform actions on multiple users

### Course Management
- **Course Overview**: Complete course listing and management
- **Content Control**: Manage course materials and resources
- **Enrollment Tracking**: Monitor student enrollments
- **Performance Analytics**: Track course performance metrics

### Financial Management
- **Revenue Tracking**: Monitor all financial transactions
- **Fee Management**: Set and manage course fees
- **Teacher Salaries**: Manage teacher compensation
- **Financial Reports**: Generate detailed financial reports

### System Settings
- **General Settings**: Basic system configuration
- **Security Settings**: Security and authentication controls
- **Notification Settings**: Configure notification preferences
- **Backup Settings**: Manage backup and recovery options

## 🔧 API Endpoints

### Admin Endpoints
- `GET /api/admin/stats/` - Get dashboard statistics
- `GET /api/admin/analytics/` - Get advanced analytics
- `GET /api/admin/recent_activity/` - Get recent system activity
- `GET /api/admin/notifications/` - Get system notifications
- `POST /api/admin/notifications/` - Create new notification
- `GET /api/admin/settings/` - Get system settings
- `PUT /api/admin/settings/` - Update system settings

### User Management
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

### Course Management
- `GET /api/courses/` - List all courses
- `POST /api/courses/` - Create new course
- `PUT /api/courses/{id}/` - Update course
- `DELETE /api/courses/{id}/` - Delete course

## 🎨 UI/UX Features

### Modern Design
- **Clean Interface**: Modern, professional design
- **Responsive Layout**: Works on all device sizes
- **Intuitive Navigation**: Easy-to-use navigation system
- **Visual Feedback**: Clear visual feedback for all actions

### Enhanced Admin Experience
- **Dashboard Overview**: Comprehensive overview with key metrics
- **Quick Actions**: Fast access to common tasks
- **Real-time Updates**: Live data updates
- **Advanced Filtering**: Powerful filtering and search capabilities

## 🔒 Security Features

- **Role-based Access Control**: Secure access based on user roles
- **JWT Authentication**: Secure token-based authentication
- **Permission System**: Granular permission controls
- **Data Validation**: Comprehensive input validation
- **SQL Injection Protection**: Built-in Django security features

## 📈 Performance Features

- **Caching**: Optimized data caching for better performance
- **Lazy Loading**: Efficient data loading strategies
- **Database Optimization**: Optimized database queries
- **CDN Support**: Content delivery network support

## 🚀 Deployment

### Production Setup
1. Configure environment variables
2. Set up production database
3. Configure static file serving
4. Set up SSL certificates
5. Configure backup systems

### Docker Deployment
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

---

**EduPortal** - Empowering education through advanced technology and comprehensive admin control. 
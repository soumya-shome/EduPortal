# Admin Role Fix Guide

## Problem
When logging in with superuser credentials, the system redirects to the student portal instead of the admin dashboard. This happens because superusers don't automatically get the 'admin' role in the database.

## Root Cause
The User model has a `role` field that defaults to 'student', and when superusers are created, they don't automatically get the 'admin' role assigned.

## Solution

### 1. Database Migration
Run the migration to fix existing superusers:

```bash
cd backend
python manage.py migrate
```

### 2. Fix Existing Superusers
Run the management command to fix existing superusers:

```bash
cd backend
python manage.py fix_admin_roles
```

### 3. Alternative: Run the Fix Script
If the management command doesn't work, run the standalone script:

```bash
cd backend
python fix_admin_roles.py
```

### 4. Create New Admin User (Optional)
To create a new admin user:

```bash
cd backend
python manage.py fix_admin_roles --create-admin --username admin --email admin@example.com --password your_password
```

## Code Changes Made

### 1. User Model Update
Updated `backend/api/models.py` to automatically set admin role for superusers:

```python
def save(self, *args, **kwargs):
    # Automatically set admin role for superusers
    if self.is_superuser and self.role != 'admin':
        self.role = 'admin'
    super().save(*args, **kwargs)
```

### 2. Login View Update
Updated `backend/api/views.py` to ensure superusers get admin role on login:

```python
@action(detail=False, methods=['post'])
def login(self, request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Ensure superusers have admin role
        if user.is_superuser and user.role != 'admin':
            user.role = 'admin'
            user.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### 3. Profile Endpoint Update
Updated the profile endpoint to ensure correct role:

```python
@action(detail=False, methods=['get'])
def profile(self, request):
    """Get current user profile."""
    user = request.user
    
    # Ensure superusers have admin role
    if user.is_superuser and user.role != 'admin':
        user.role = 'admin'
        user.save()
    
    serializer = self.get_serializer(user)
    return Response(serializer.data)
```

## Verification Steps

1. **Check Current Admin Users**:
   ```bash
   cd backend
   python manage.py shell
   ```
   ```python
   from api.models import User
   admin_users = User.objects.filter(role='admin')
   for user in admin_users:
       print(f"{user.username}: {user.role} (superuser: {user.is_superuser})")
   ```

2. **Test Login**:
   - Log in with superuser credentials
   - Should be redirected to admin dashboard
   - Check browser console for any errors

3. **Check User Role in Frontend**:
   - Open browser developer tools
   - Check the user object in localStorage or React state
   - Verify `role` is set to 'admin'

## Troubleshooting

### If still redirecting to student portal:

1. **Clear Browser Cache**:
   - Clear localStorage
   - Clear sessionStorage
   - Hard refresh the page

2. **Check Database**:
   ```python
   from api.models import User
   user = User.objects.get(username='your_superuser_username')
   print(f"Role: {user.role}, Superuser: {user.is_superuser}")
   ```

3. **Check API Response**:
   - Open browser developer tools
   - Go to Network tab
   - Login and check the response from `/api/auth/login/`
   - Verify the user object has `role: "admin"`

### If management command fails:

1. **Run Migration Manually**:
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Update Superusers Manually**:
   ```python
   from api.models import User
   superusers = User.objects.filter(is_superuser=True)
   for user in superusers:
       user.role = 'admin'
       user.save()
   ```

## Expected Behavior

After applying the fix:

1. **Superuser Login**: Should redirect to admin dashboard
2. **Role Assignment**: Superusers should have `role: "admin"`
3. **Admin Access**: Should have access to all admin features
4. **Frontend Routing**: Should show admin dashboard with enhanced features

## Admin Dashboard Features

Once the role is fixed, superusers will have access to:

- **Enhanced Dashboard**: Real-time statistics and analytics
- **User Management**: Complete user control
- **Course Administration**: Full course management
- **Financial Management**: Revenue tracking and fee management
- **System Settings**: Complete system configuration
- **Analytics**: Advanced reporting and insights
- **Notifications**: System-wide notification management

## Security Notes

- Only superusers should have admin role
- Admin role provides full system access
- Regular users cannot be promoted to admin through the UI
- Admin role is automatically assigned to superusers
- Role changes are logged and auditable 
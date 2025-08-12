import logging
import time
import json
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

# Get logger for middleware
logger = logging.getLogger('api.middleware')


def safe_serialize_headers(headers):
    """
    Safely serialize headers for logging, handling non-serializable objects.
    """
    safe_headers = {}
    for key, value in headers.items():
        try:
            # Convert to string if it's not a basic type
            if isinstance(value, (str, int, float, bool, type(None))):
                safe_headers[key] = value
            else:
                safe_headers[key] = str(value)
        except Exception:
            safe_headers[key] = f"[Non-serializable: {type(value).__name__}]"
    return safe_headers


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all HTTP requests and responses.
    """
    
    def process_request(self, request):
        """Log incoming request details."""
        request.start_time = time.time()
        
        # Log request details
        logger.info(f"=== REQUEST START ===")
        logger.info(f"Method: {request.method}")
        logger.info(f"URL: {request.path}")
        logger.info(f"User: {request.user.username if request.user.is_authenticated else 'Anonymous'}")
        logger.info(f"User Role: {getattr(request.user, 'role', 'N/A')}")
        logger.info(f"IP Address: {self.get_client_ip(request)}")
        logger.info(f"User Agent: {request.META.get('HTTP_USER_AGENT', 'N/A')}")
        
        # Log request headers (sensitive ones filtered)
        try:
            headers = dict(request.META)
            sensitive_headers = ['HTTP_AUTHORIZATION', 'HTTP_COOKIE', 'HTTP_X_CSRFTOKEN']
            for header in sensitive_headers:
                if header in headers:
                    headers[header] = '[REDACTED]'
            
            # Safely serialize headers
            safe_headers = safe_serialize_headers(headers)
            logger.debug(f"Request Headers: {json.dumps(safe_headers, indent=2)}")
        except Exception as e:
            logger.warning(f"Could not log request headers: {str(e)}")
        
        # Log request body for POST/PUT/PATCH requests
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                if hasattr(request, 'body') and request.body:
                    # Handle different content types
                    content_type = request.META.get('CONTENT_TYPE', '')
                    
                    if 'application/json' in content_type:
                        try:
                            body = request.body.decode('utf-8')
                            # Filter sensitive data
                            if 'password' in body.lower():
                                body = '[REDACTED - CONTAINS PASSWORD]'
                            logger.debug(f"Request Body (JSON): {body}")
                        except Exception as e:
                            logger.debug(f"Request Body (JSON decode error): {str(e)}")
                    
                    elif 'multipart/form-data' in content_type:
                        # For file uploads, just log the form data keys
                        if hasattr(request, 'POST'):
                            form_data = dict(request.POST)
                            # Remove sensitive fields
                            sensitive_fields = ['password', 'token', 'key']
                            for field in sensitive_fields:
                                if field in form_data:
                                    form_data[field] = '[REDACTED]'
                            logger.debug(f"Request Form Data: {form_data}")
                        
                        # Log file information if present
                        if hasattr(request, 'FILES') and request.FILES:
                            file_info = {}
                            for field_name, file_obj in request.FILES.items():
                                file_info[field_name] = {
                                    'name': file_obj.name,
                                    'size': file_obj.size,
                                    'content_type': file_obj.content_type
                                }
                            logger.debug(f"Request Files: {file_info}")
                    
                    else:
                        # For other content types, just log the size
                        body_size = len(request.body)
                        logger.debug(f"Request Body Size: {body_size} bytes")
                        
            except Exception as e:
                logger.warning(f"Could not log request body: {str(e)}")
        
        # Log query parameters
        if request.GET:
            logger.debug(f"Query Parameters: {dict(request.GET)}")
        
        return None
    
    def process_response(self, request, response):
        """Log response details."""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
        else:
            duration = 0
        
        # Log response details
        logger.info(f"=== RESPONSE END ===")
        logger.info(f"Status Code: {response.status_code}")
        logger.info(f"Duration: {duration:.3f}s")
        logger.info(f"Content Type: {response.get('Content-Type', 'N/A')}")
        
        # Log response size
        if hasattr(response, 'content'):
            size = len(response.content)
            logger.info(f"Response Size: {size} bytes")
        
        # Log error details for 4xx and 5xx responses
        if response.status_code >= 400:
            logger.error(f"Error Response: {response.status_code}")
            if hasattr(response, 'content'):
                try:
                    error_content = response.content.decode('utf-8')
                    logger.error(f"Error Details: {error_content}")
                except Exception as e:
                    logger.error(f"Could not decode error content: {str(e)}")
        
        return response
    
    def process_exception(self, request, exception):
        """Log exceptions."""
        logger.error(f"=== EXCEPTION ===")
        logger.error(f"Exception Type: {type(exception).__name__}")
        logger.error(f"Exception Message: {str(exception)}")
        logger.error(f"Request URL: {request.path}")
        logger.error(f"Request Method: {request.method}")
        logger.error(f"User: {request.user.username if request.user.is_authenticated else 'Anonymous'}")
        
        # Log stack trace
        import traceback
        logger.error(f"Stack Trace: {traceback.format_exc()}")
        
        return None
    
    def get_client_ip(self, request):
        """Get the client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PerformanceLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log performance metrics.
    """
    
    def process_request(self, request):
        """Start timing the request."""
        request.start_time = time.time()
        return None
    
    def process_response(self, request, response):
        """Log performance metrics."""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Log slow requests
            if duration > 1.0:  # More than 1 second
                logger.warning(f"SLOW REQUEST: {request.method} {request.path} took {duration:.3f}s")
            
            # Log performance metrics
            logger.info(f"Performance: {request.method} {request.path} - {duration:.3f}s")
        
        return response


class DatabaseLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log database queries.
    """
    
    def process_request(self, request):
        """Initialize query count."""
        request.db_query_count = 0
        request.db_query_time = 0
        return None
    
    def process_response(self, request, response):
        """Log database performance."""
        if hasattr(request, 'db_query_count'):
            logger.info(f"Database Queries: {request.db_query_count} queries")
            logger.info(f"Database Time: {request.db_query_time:.3f}s")
        
        return response


class AuthenticationLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log authentication events.
    """
    
    def process_request(self, request):
        """Log authentication status."""
        if request.user.is_authenticated:
            logger.debug(f"Authenticated User: {request.user.username} (Role: {request.user.role})")
        else:
            logger.debug("Anonymous User")
        
        return None


class APILoggingMiddleware(MiddlewareMixin):
    """
    Middleware specifically for API request logging.
    """
    
    def process_request(self, request):
        """Log API-specific request details."""
        if request.path.startswith('/api/'):
            logger.info(f"API Request: {request.method} {request.path}")
            logger.debug(f"API User: {request.user.username if request.user.is_authenticated else 'Anonymous'}")
            logger.debug(f"API User Role: {getattr(request.user, 'role', 'N/A')}")
            
            # Log API version if present
            api_version = request.META.get('HTTP_ACCEPT_VERSION', 'N/A')
            if api_version != 'N/A':
                logger.debug(f"API Version: {api_version}")
        
        return None
    
    def process_response(self, request, response):
        """Log API-specific response details."""
        if request.path.startswith('/api/'):
            logger.info(f"API Response: {request.method} {request.path} - {response.status_code}")
            
            # Log API response time
            if hasattr(request, 'start_time'):
                duration = time.time() - request.start_time
                logger.info(f"API Duration: {duration:.3f}s")
        
        return response 


class CSRFExemptMiddleware(MiddlewareMixin):
    """
    Middleware to exempt API endpoints from CSRF protection.
    """
    
    def process_request(self, request):
        """Exempt API endpoints from CSRF protection."""
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None 
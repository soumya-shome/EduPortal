import logging
import json
from django.core.serializers.json import DjangoJSONEncoder
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('api.utils')


def safe_serialize(obj):
    """
    Safely serialize an object for logging purposes.
    Handles non-serializable objects gracefully.
    """
    try:
        if isinstance(obj, dict):
            return json.dumps(obj, cls=DjangoJSONEncoder, indent=2)
        elif isinstance(obj, (list, tuple)):
            return json.dumps(obj, cls=DjangoJSONEncoder, indent=2)
        elif hasattr(obj, '__dict__'):
            # For objects, try to get their dict representation
            return str(obj.__dict__)
        else:
            return str(obj)
    except (TypeError, ValueError) as e:
        return f"[Non-serializable object: {type(obj).__name__}]"


def safe_log_data(data, prefix="Data"):
    """
    Safely log data without causing serialization errors.
    """
    try:
        if isinstance(data, dict):
            # Filter out sensitive fields
            sensitive_fields = ['password', 'token', 'key', 'secret']
            filtered_data = {}
            for key, value in data.items():
                if any(field in key.lower() for field in sensitive_fields):
                    filtered_data[key] = '[REDACTED]'
                else:
                    filtered_data[key] = value
            logger.debug(f"{prefix}: {safe_serialize(filtered_data)}")
        elif isinstance(data, (list, tuple)):
            logger.debug(f"{prefix}: {safe_serialize(data)}")
        else:
            logger.debug(f"{prefix}: {str(data)}")
    except Exception as e:
        logger.debug(f"Could not log {prefix.lower()}: {str(e)}")


def safe_log_request(request, method_name):
    """Safely log request information."""
    try:
        logger.info(f"Request to {method_name}: {request.method} {request.path}")
        logger.debug(f"User: {request.user.username if request.user.is_authenticated else 'Anonymous'}")
    except Exception as e:
        logger.warning(f"Could not log request: {str(e)}")


def safe_log_response(response_data, method_name):
    """Safely log response information."""
    try:
        logger.info(f"Response from {method_name}: {type(response_data)}")
    except Exception as e:
        logger.warning(f"Could not log response: {str(e)}")


def safe_log_error(error, method_name):
    """Safely log error information."""
    try:
        logger.error(f"Error in {method_name}: {str(error)}")
    except Exception as e:
        logger.warning(f"Could not log error: {str(e)}")


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF.
    """
    # Call DRF's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Log the exception
        logger.error(f"DRF Exception: {type(exc).__name__}: {str(exc)}")
        logger.error(f"Context: {context}")
        
        # Add custom error details if needed
        if hasattr(exc, 'detail'):
            response.data['error_type'] = type(exc).__name__
            response.data['error_message'] = str(exc)
    
    return response 
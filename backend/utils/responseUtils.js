// Professional response utilities
class ApiResponse {
  constructor(success, data = null, message = '', statusCode = 200) {
    this.success = success;
    this.statusCode = statusCode;
    
    if (success) {
      this.data = data;
      if (message) this.message = message;
    } else {
      this.error = {
        message: message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack })
      };
    }
  }

  // Success responses
  static success(data, message = 'Success', statusCode = 200) {
    return new ApiResponse(true, data, message, statusCode);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(true, data, message, 201);
  }

  static accepted(message = 'Request accepted for processing') {
    return new ApiResponse(true, null, message, 202);
  }

  static noContent(message = 'Request completed successfully') {
    return new ApiResponse(true, null, message, 204);
  }

  // Error responses
  static badRequest(message = 'Bad request', details = null) {
    const response = new ApiResponse(false, null, message, 400);
    if (details) response.error.details = details;
    return response;
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiResponse(false, null, message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiResponse(false, null, message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new ApiResponse(false, null, message, 404);
  }

  static conflict(message = 'Resource conflict') {
    return new ApiResponse(false, null, message, 409);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiResponse(false, null, message, 429);
  }

  static internalError(message = 'Internal server error') {
    return new ApiResponse(false, null, message, 500);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new ApiResponse(false, null, message, 503);
  }

  // Pagination helper
  static paginated(data, pagination, message = 'Data retrieved successfully') {
    return new ApiResponse(true, {
      items: data,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        pages: pagination.pages || 0,
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false
      }
    }, message, 200);
  }

  // Validation error helper
  static validation(errors, message = 'Validation failed') {
    return new ApiResponse(false, null, message, 400).error.errors = errors;
  }
}

// Express middleware for consistent responses
const sendResponse = (req, res, next) => {
  res.apiResponse = (response) => {
    const statusCode = response.statusCode || 200;
    return res.status(statusCode).json(response);
  };

  // Convenience methods
  res.success = (data, message) => 
    res.apiResponse(ApiResponse.success(data, message));

  res.created = (data, message) => 
    res.apiResponse(ApiResponse.created(data, message));

  res.badRequest = (message, details) => 
    res.apiResponse(ApiResponse.badRequest(message, details));

  res.unauthorized = (message) => 
    res.apiResponse(ApiResponse.unauthorized(message));

  res.forbidden = (message) => 
    res.apiResponse(ApiResponse.forbidden(message));

  res.notFound = (message) => 
    res.apiResponse(ApiResponse.notFound(message));

  res.internalError = (message) => 
    res.apiResponse(ApiResponse.internalError(message));

  next();
};

module.exports = { ApiResponse, sendResponse };

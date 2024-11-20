// src/utils/errorResponse.js
class ErrorResponse extends Error {
  constructor(message, statusCode, details = null) {
      super(message);
      this.exito = false;
      this.error = message;
      this.statusCode = statusCode;
      if (details) {
          this.detalles = details;
      }
      
      // Capture stack trace
      Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;
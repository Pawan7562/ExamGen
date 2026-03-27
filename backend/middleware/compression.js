const compression = require('compression');
const { logger } = require('./errorHandler');

// Compression configuration
const compressionConfig = {
  // Filter function to determine which requests to compress
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      // Don't compress responses with this header
      return false;
    }
    
    // Only compress responses that can be compressed
    const type = res.getHeader('Content-Type');
    if (type) {
      const compressibleTypes = [
        'text/',
        'application/json',
        'application/javascript',
        'application/xml',
        'text/xml',
        'text/css',
        'text/html',
        'text/plain',
        'text/javascript',
        'image/svg+xml'
      ];
      
      return compressibleTypes.some(compressibleType => 
        type.includes(compressibleType)
      );
    }
    
    return compression.filter(req, res);
  },
  
  // Compression level (0-9, where 9 is highest compression)
  level: 6,
  
  // Threshold in bytes to compress
  threshold: 1024,
  
  // Window size
  windowBits: 15,
  
  // Memory level (1-9)
  memLevel: 8,
  
  // Strategy for compression
  strategy: compression.constants.Z_DEFAULT_STRATEGY
};

// Brotli compression (if available)
const brotliCompression = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('br')) {
    // Use Brotli compression if supported
    res.setHeader('Content-Encoding', 'br');
    // Note: You would need to implement actual Brotli compression here
    // This is a placeholder for demonstration
  }
  
  next();
};

// Image optimization middleware
const imageOptimization = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Check if the response is an image
    const contentType = res.getHeader('Content-Type');
    if (contentType && contentType.startsWith('image/')) {
      // Add image optimization headers
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      res.setHeader('Vary', 'Accept-Encoding');
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Static asset optimization
const staticAssetOptimization = (req, res, next) => {
  // Add headers for static assets
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('ETag', Date.now().toString());
  }
  
  next();
};

// Minification middleware for JSON responses
const jsonMinification = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Minify JSON by removing unnecessary whitespace
    const minifiedData = JSON.stringify(data);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(minifiedData, 'utf8'));
    
    originalSend.call(this, minifiedData);
  };
  
  next();
};

// Bundle optimization for frontend assets
const bundleOptimization = (req, res, next) => {
  // Add headers for bundled assets
  if (req.url.match(/\/(dist|build)\//)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
  
  next();
};

// Performance monitoring for compression
const compressionMonitor = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  const originalJson = res.json;
  
  const logCompression = (data) => {
    const duration = Date.now() - startTime;
    const contentLength = res.getHeader('Content-Length') || 0;
    const contentEncoding = res.getHeader('Content-Encoding') || 'none';
    
    logger.debug('Compression metrics:', {
      url: req.originalUrl,
      duration: `${duration}ms`,
      contentLength: `${contentLength} bytes`,
      encoding: contentEncoding,
      userAgent: req.get('User-Agent')
    });
  };
  
  res.send = function(data) {
    logCompression(data);
    originalSend.call(this, data);
  };
  
  res.json = function(data) {
    logCompression(data);
    originalJson.call(this, data);
  };
  
  next();
};

// Conditional compression based on response size
const smartCompression = compression({
  ...compressionConfig,
  filter: (req, res) => {
    // Don't compress very small responses
    const contentLength = res.getHeader('Content-Length');
    if (contentLength && parseInt(contentLength) < 860) {
      return false;
    }
    
    // Don't compress if client doesn't accept compression
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (!acceptEncoding.includes('gzip') && !acceptEncoding.includes('deflate')) {
      return false;
    }
    
    return compressionConfig.filter(req, res);
  }
});

// Compression statistics
const compressionStats = {
  totalRequests: 0,
  compressedResponses: 0,
  totalBytesSaved: 0,
  averageCompressionRatio: 0
};

// Middleware to track compression statistics
const trackCompressionStats = (req, res, next) => {
  compressionStats.totalRequests++;
  
  const originalSend = res.send;
  const originalJson = res.json;
  
  const trackStats = (data) => {
    const contentEncoding = res.getHeader('Content-Encoding');
    if (contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('deflate'))) {
      compressionStats.compressedResponses++;
      
      // Calculate compression ratio (simplified)
      const contentLength = res.getHeader('Content-Length') || 0;
      const originalSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
      const savedBytes = originalSize - contentLength;
      
      compressionStats.totalBytesSaved += savedBytes;
      compressionStats.averageCompressionRatio = 
        (compressionStats.totalBytesSaved / (originalSize || 1)) * 100;
    }
  };
  
  res.send = function(data) {
    trackStats(data);
    originalSend.call(this, data);
  };
  
  res.json = function(data) {
    trackStats(data);
    originalJson.call(this, data);
  };
  
  next();
};

// Get compression statistics
const getCompressionStats = () => {
  return {
    ...compressionStats,
    compressionRatio: compressionStats.averageCompressionRatio.toFixed(2) + '%',
    totalRequests: compressionStats.totalRequests,
    compressedResponses: compressionStats.compressedResponses,
    compressionRate: ((compressionStats.compressedResponses / compressionStats.totalRequests) * 100).toFixed(2) + '%'
  };
};

module.exports = {
  compression: smartCompression,
  brotliCompression,
  imageOptimization,
  staticAssetOptimization,
  jsonMinification,
  bundleOptimization,
  compressionMonitor,
  trackCompressionStats,
  getCompressionStats
};

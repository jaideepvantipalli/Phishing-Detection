/**
 * Utility Helpers
 */

export const handleError = (res, error, message = 'Internal Server Error') => {
  console.error(error);
  res.status(500).json({
    message,
    error: error.message
  });
};

export const parseHostname = (url) => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    return urlObj.hostname.toLowerCase();
  } catch (e) {
    return url.toLowerCase();
  }
};

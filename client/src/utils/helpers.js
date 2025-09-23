/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

/**
 * Format a date string to a readable datetime format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted datetime
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

/**
 * Validate if a URL is a valid Google Drive URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid Google Drive URL
 */
export const isValidGoogleDriveUrl = (url) => {
  return url && (url.includes('drive.google.com') || url.includes('docs.google.com'))
}

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format a number as a percentage
 * @param {number} value - Value to format
 * @param {number} total - Total value
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${Math.round(percentage)}%`
}
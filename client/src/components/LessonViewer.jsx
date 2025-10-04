import React from 'react';

/**
 * Extract Google Drive video ID from various URL formats
 * Supports formats:
 * - https://drive.google.com/file/d/VIDEO_ID/view
 * - https://drive.google.com/open?id=VIDEO_ID
 * - https://drive.google.com/uc?id=VIDEO_ID
 */
const extractGoogleDriveId = (url) => {
  if (!url) return null;

  // Format: /file/d/VIDEO_ID/
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) return fileMatch[1];

  // Format: ?id=VIDEO_ID
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch) return idMatch[1];

  return null;
};

/**
 * LessonViewer Component
 * Displays a lesson title and embedded Google Drive video player
 */
const LessonViewer = ({ lesson }) => {
  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No lesson selected</h3>
          <p className="mt-1 text-sm text-gray-500">Select a lesson from the sidebar to start learning</p>
        </div>
      </div>
    );
  }

  const videoId = extractGoogleDriveId(lesson.videoLink);

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-red-50 rounded-lg border border-red-200">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-red-900">Invalid video link</h3>
          <p className="mt-1 text-sm text-red-600">The video link for this lesson is not valid</p>
        </div>
      </div>
    );
  }

  const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;

  return (
    <div className="space-y-4">
      {/* Lesson Title */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
      </div>

      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden shadow-lg">
        <div className="relative" style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}>
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <svg
            className="h-5 w-5 text-blue-600 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Learning Tip</p>
            <p className="text-sm text-blue-700 mt-1">
              Take notes while watching and don't hesitate to pause and rewatch sections you find challenging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;

/**
 * FileIcon Component
 * Displays an icon based on file type with optional color and size
 */
import {
  File,
  FileText,
  FileType,
  Sheet,
  Presentation,
  Image as ImageIcon,
  Video,
  Music,
  Archive
} from 'lucide-react';
import { getFileIconName, getFileColor } from '@/utils/fileHelpers';

const iconMap = {
  File,
  FileText,
  FileType,
  Sheet,
  Presentation,
  Image: ImageIcon,
  Video,
  Music,
  Archive
};

export default function FileIcon({ mimeType, size = 24, className = '' }) {
  const iconName = getFileIconName(mimeType);
  const colorClass = getFileColor(mimeType);
  const IconComponent = iconMap[iconName] || File;

  return (
    <IconComponent
      size={size}
      className={`${colorClass} ${className}`}
    />
  );
}

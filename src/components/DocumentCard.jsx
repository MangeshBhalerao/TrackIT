import { 
  FileIcon, 
  ImageIcon, 
  FileTextIcon, 
  FileSpreadsheetIcon, 
  PresentationIcon 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DocumentCard({ document }) {
  const { title, category, file_url, file_type, created_at } = document;

  const getFileIcon = () => {
    if (file_type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6" />;
    }
    switch (file_type) {
      case 'application/pdf':
        return <FileTextIcon className="w-6 h-6" />;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        return <FileSpreadsheetIcon className="w-6 h-6" />;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      case 'application/vnd.ms-powerpoint':
        return <PresentationIcon className="w-6 h-6" />;
      default:
        return <FileIcon className="w-6 h-6" />;
    }
  };

  const getThumbnailUrl = () => {
    // If it's an image, create a thumbnail using Cloudinary
    if (file_type.startsWith('image/')) {
      // Extract the public ID from the URL
      const urlParts = file_url.split('/');
      const publicIdWithExtension = urlParts.slice(-2).join('/'); // Get the last two parts (folder/filename)
      const publicId = publicIdWithExtension.split('.')[0]; // Remove extension
      
      // Create a thumbnail URL with Cloudinary transformations
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_200,h_200,q_auto/${publicId}`;
    }

    // For PDFs, generate a thumbnail of the first page
    if (file_type === 'application/pdf') {
      const urlParts = file_url.split('/');
      const publicIdWithExtension = urlParts.slice(-2).join('/');
      const publicId = publicIdWithExtension.split('.')[0];
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_200,h_200,q_auto,pg_1/${publicId}`;
    }

    return null;
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <div className="bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {thumbnailUrl ? (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-900">
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full items-center justify-center">
                {getFileIcon()}
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-zinc-900 flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
          <p className="text-sm text-zinc-400 mt-1">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Added {formatDistanceToNow(new Date(created_at))} ago
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end space-x-2">
        <a
          href={file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          View
        </a>
        <button
          onClick={() => window.open(file_url, '_blank')}
          className="px-3 py-1 text-sm bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
        >
          Download
        </button>
      </div>
    </div>
  );
} 
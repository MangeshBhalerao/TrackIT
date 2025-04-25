import { 
  FileIcon, 
  ImageIcon, 
  FileTextIcon, 
  FileSpreadsheetIcon, 
  PresentationIcon,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function DocumentCard({ document, onDelete }) {
  const { id, title, category, file_url, file_type, created_at, public_id } = document;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success('Document deleted successfully');
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

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

  const getViewUrl = () => {
    if (file_type === 'application/pdf') {
      // For PDFs, use the direct Cloudinary URL with the correct format
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      // Extract the public ID from the file_url
      const urlParts = file_url.split('/');
      const publicIdWithExtension = urlParts.slice(-2).join('/');
      return `https://res.cloudinary.com/${cloudName}/image/upload/${publicIdWithExtension}`;
    }
    return file_url;
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
  const viewUrl = getViewUrl();

  return (
    <div className="bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
      <div className="flex flex-col space-y-4">
        <div className="flex-shrink-0">
          {thumbnailUrl ? (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-zinc-900">
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
            <div className="w-full h-48 rounded-lg bg-zinc-900 flex items-center justify-center">
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

        <div className="flex items-center justify-end space-x-2">
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            View
          </a>
          <a
            href={viewUrl}
            download
            className="px-3 py-1 text-sm bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
          >
            Download
          </a>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 
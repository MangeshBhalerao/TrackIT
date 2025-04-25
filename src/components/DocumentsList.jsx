import { useEffect, useState } from 'react';
import DocumentCard from './DocumentCard';

export default function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentDelete = (deletedId) => {
    setDocuments(documents.filter(doc => doc.id !== deletedId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center text-zinc-500 p-8">
        No documents found. Upload some documents to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <DocumentCard 
          key={document.id} 
          document={document} 
          onDelete={handleDocumentDelete}
        />
      ))}
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import DocumentCard from './DocumentCard';
import DocumentUpload from './DocumentUpload';
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);

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
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(data.map(doc => doc.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleUploadComplete = (newDocument) => {
    setDocuments(prev => [newDocument, ...prev]);
    // Add new category if it doesn't exist
    if (!categories.includes(newDocument.category)) {
      setCategories(prev => [...prev, newDocument.category]);
    }
  };

  const handleDelete = (deletedId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== deletedId));
  };

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-black border-zinc-800 text-white hover:bg-zinc-900">
                {selectedCategory === 'all' ? 'All Categories' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black border-zinc-800 text-white">
              {categories.map(category => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="hover:bg-zinc-800 cursor-pointer"
                >
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map(document => (
          <DocumentCard
            key={document.id}
            document={document}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <DocumentUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
} 
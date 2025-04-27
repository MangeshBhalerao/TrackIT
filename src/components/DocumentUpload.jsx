'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, File } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DocumentUpload({ isOpen, onClose, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'TrackIT');
      formData.append('resource_type', 'auto'); // Let Cloudinary detect the file type

      console.log('Uploading to Cloudinary with:', {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        fileType: file.type,
        fileName: file.name
      });

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary upload error:', errorData);
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      console.log('Cloudinary upload success:', data);

      return {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    try {
      const file = acceptedFiles[0];
      setFile(file);
      setTitle(file.name.split('.')[0]); // Set default title from filename
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleUpload = async () => {
    if (!file || !title) {
      setError('Please provide a file and title');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      console.log('Starting upload to Cloudinary...');
      // Upload to Cloudinary first
      const uploadResult = await uploadToCloudinary(file);
      console.log('Cloudinary upload result:', uploadResult);

      // Create document record in database
      const documentData = {
        title: title.trim(),
        category: category || 'general',
        file_url: uploadResult.url,
        file_type: file.type,
        file_size: file.size,
        public_id: uploadResult.publicId
      };

      console.log('Sending document data to API:', documentData);
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save document metadata');
      }

      const savedDocument = await response.json();
      console.log('Document saved successfully:', savedDocument);
      toast.success('Document uploaded successfully!');
      onUploadComplete?.(savedDocument);
      
      // Reset form and close modal
      setFile(null);
      setTitle('');
      setCategory('');
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      toast.error('Failed to upload document: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10485760, // 10MB
    onDropRejected: (rejectedFiles) => {
      const errors = rejectedFiles.map(rejection => 
        rejection.errors.map(error => error.message)
      ).flat();
      setError(errors.join(', '));
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div {...getRootProps()} className="outline-none">
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50/10' : 'border-zinc-800 hover:border-zinc-700'}`}
              style={{ minHeight: '200px' }}
            >
              <input {...getInputProps()} />
              <div className="absolute inset-0 flex items-center justify-center">
                {file ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <File className="h-8 w-8 text-white" />
                    <p className="text-sm text-white">{file.name}</p>
                    <p className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-12 w-12 text-white/50" />
                    <p className="text-white">
                      {isDragActive
                        ? 'Drop the file here'
                        : 'Drag & drop a file here, or click to select'}
                    </p>
                    <p className="text-sm text-zinc-400 mt-2">
                      Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white">Document Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                className="bg-black border-zinc-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-white">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-black border-zinc-800 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-black border-zinc-800 text-white">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="reports">Reports</SelectItem>
                  <SelectItem value="presentations">Presentations</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="text-white border-zinc-800 bg-black hover:bg-zinc-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="bg-gray-800/30 text-white hover:bg-blue-600"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
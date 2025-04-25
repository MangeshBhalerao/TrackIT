'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Upload, 
  File, 
  MoreVertical, 
  Download, 
  Trash2, 
  Share2,
  Search,
  Grid,
  List
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DocumentUpload from '@/components/DocumentUpload'
import { format } from "date-fns"

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents')
        if (!response.ok) throw new Error('Failed to fetch documents')
        const data = await response.json()
        setDocuments(data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  // Handle document upload completion
  const handleUploadComplete = (newDocument) => {
    console.log('Upload complete:', newDocument);
    setDocuments(prevDocuments => [newDocument, ...prevDocuments])
    setIsUploadModalOpen(false)
  }

  // Handle document deletion
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      setDocuments(documents.filter(doc => doc.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Documents</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="text-white border-white/20 hover:bg-white/10"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            <Button 
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {/* Documents Grid/List View */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
          {loading ? (
            <div className="text-white">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-zinc-400">No documents uploaded yet.</div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors
                  ${viewMode === 'grid' ? '' : 'flex items-center justify-between'}`}
              >
                <div className={`flex items-center gap-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="p-2 bg-white/10 rounded-lg">
                    <File className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{doc.title}</h3>
                    <p className="text-sm text-white/70">
                      {doc.category} • {format(new Date(doc.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/10 border-white/10">
                      <DropdownMenuItem 
                        className="text-white hover:bg-white/10"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-white hover:bg-white/10"
                        onClick={() => navigator.clipboard.writeText(doc.file_url)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-400 hover:bg-white/10"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <DocumentUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
} 
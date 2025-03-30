'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Upload, 
  File, 
  Folder, 
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
import DocumentUploadModal from '@/components/DocumentUploadModal'

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Project Proposal.pdf',
      type: 'pdf',
      size: '2.4 MB',
      lastModified: '2024-03-15',
      uploadedBy: 'John Doe'
    },
    {
      id: 2,
      name: 'Design Assets.zip',
      type: 'zip',
      size: '15.8 MB',
      lastModified: '2024-03-14',
      uploadedBy: 'Jane Smith'
    },
    // Add more mock documents as needed
  ])

  const handleUpload = (files, description) => {
    // Here you would typically handle the actual file upload to your backend
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      type: file.name.split('.').pop(),
      size: formatFileSize(file.size),
      lastModified: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current User', // Replace with actual user
      description
    }))

    setDocuments(prev => [...prev, ...newDocuments])
  }

  const handleDelete = (documentId) => {
    setDocuments(documents.filter(doc => doc.id !== documentId))
  }

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
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

        {/* Search and Filter Section */}
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
          {filteredDocuments.map((doc) => (
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
                  <h3 className="text-white font-medium">{doc.name}</h3>
                  <p className="text-sm text-white/70">
                    {doc.size} • {doc.lastModified}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/10 border-white/10">
                    <DropdownMenuItem className="text-white hover:bg-white/10">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/10">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
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
          ))}
        </div>
      </div>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  )
} 
'use client'

import { useState } from 'react'
import DocumentsList from '@/components/DocumentsList'
import DocumentUpload from '@/components/DocumentUpload'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function DocumentsPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between border-b border-zinc-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-zinc-400 mt-1">
            Upload and manage your documents
          </p>
        </div>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-gray-800/30 border border-zinc-800 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <DocumentsList />

      <DocumentUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => {
          setIsUploadModalOpen(false)
          // Force a refresh of the documents list
          window.location.reload()
        }}
      />
    </div>
  )
} 
'use client'

import { useState } from 'react'
import DocumentList from '@/components/DocumentList'
import DocumentUpload from '@/components/DocumentUpload'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function DocumentsPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  return (
    <div className="space-y-6 pt-4">
      <DocumentList />
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
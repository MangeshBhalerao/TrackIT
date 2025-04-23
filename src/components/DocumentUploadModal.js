import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, X, File } from 'lucide-react'

export default function DocumentUploadModal({ isOpen, onClose, onUpload }) {
  const [files, setFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})
  const [description, setDescription] = useState('')

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    // Simulate upload progress
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(prev => ({ ...prev, [i]: 0 }))
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setUploadProgress(prev => ({ ...prev, [i]: progress }))
      }
    }

    // Call the onUpload callback with the files and description
    onUpload(files, description)
    onClose()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Documents</DialogTitle>
          <DialogDescription className="text-white/70">
            Upload your documents and add a description
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              onChange={handleFileSelect}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-12 w-12 text-white/50" />
              <p className="text-white/70">
                Drag and drop files here, or click to select files
              </p>
              <p className="text-sm text-white/50">
                Maximum file size: 100MB
              </p>
            </label>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white">Selected Files</Label>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-white/50" />
                      <div>
                        <p className="text-white">{file.name}</p>
                        <p className="text-sm text-white/50">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadProgress[index] !== undefined && (
                        <Progress
                          value={uploadProgress[index]}
                          className="w-24"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0 hover:bg-white/10"
                      >
                        <X className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your documents..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
import { NextResponse } from 'next/server';

// Mock database for documents (replace with real DB and storage later)
let documents = [];

// GET /api/documents - Get all documents or specific document
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Return specific document
      const document = documents.find(doc => doc.id === id);
      
      if (!document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(document, { status: 200 });
    }
    
    // Return all documents
    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Add document metadata
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // In a real implementation, you would:
    // 1. Upload file to storage (Firebase, UploadThing, etc.)
    // 2. Process file if needed (PDF parsing, etc.)
    // 3. Save metadata to database
    
    // For now, we'll just store metadata
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Create document metadata
    const newDocument = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date().toISOString(),
      description: formData.get('description') || '',
      uploadedBy: 'Current User',
      // In a real implementation, you would store the URL from your storage service
      url: `/api/documents?id=${Date.now().toString()}`
    };
    
    documents.push(newDocument);
    
    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// PUT /api/documents - Update document metadata
export async function PUT(request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Find and update document
    const docIndex = documents.findIndex(doc => doc.id === body.id);
    
    if (docIndex === -1) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    documents[docIndex] = { ...documents[docIndex], ...body };
    
    return NextResponse.json(documents[docIndex], { status: 200 });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents?id=123 - Delete a document
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would:
    // 1. Delete file from storage
    // 2. Remove metadata from database
    
    const initialLength = documents.length;
    documents = documents.filter(doc => doc.id !== id);
    
    if (documents.length === initialLength) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 
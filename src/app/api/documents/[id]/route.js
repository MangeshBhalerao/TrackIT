import { NextResponse } from 'next/server';
import { deleteDocument } from '@/lib/db';
import { deleteFile } from '@/lib/cloudinary';

export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get the document first to get the public_id
    const response = await fetch(`${request.nextUrl.origin}/api/documents/${id}`);
    if (!response.ok) {
      throw new Error('Document not found');
    }
    const document = await response.json();

    // Delete from Cloudinary
    if (document.public_id) {
      await deleteFile(document.public_id);
    }

    // Delete from database
    const deletedDocument = await deleteDocument(parseInt(id));
    
    if (!deletedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(deletedDocument);
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
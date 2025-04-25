import { NextResponse } from 'next/server';
import { deleteDocument, getDocuments } from '@/lib/db.js';
import { deleteFile } from '@/lib/cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get all documents and find the one we want to delete
    const documents = await getDocuments();
    const document = documents.find(doc => doc.id === parseInt(id));
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary if public_id exists
    if (document.public_id) {
      try {
        await deleteFile(document.public_id);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    const deletedDocument = await deleteDocument(parseInt(id));
    
    if (!deletedDocument) {
      return NextResponse.json(
        { error: 'Failed to delete document from database' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(deletedDocument);
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document: ' + error.message },
      { status: 500 }
    );
  }
} 
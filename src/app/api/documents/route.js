import { createDocument, getDocuments } from '@/lib/db';
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function GET() {
  try {
    const documents = await getDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received document data:', data);

    // Validate required fields
    const requiredFields = ['title', 'file_url', 'file_type', 'file_size', 'public_id'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create document in database
    const document = await createDocument({
      title: data.title,
      category: data.category || 'general',
      file_url: data.file_url,
      file_type: data.file_type,
      file_size: data.file_size,
      public_id: data.public_id
    });

    console.log('Document created successfully:', document);
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    // Log the full error details
    console.error('Full error object:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return NextResponse.json(
      { error: 'Failed to create document: ' + error.message },
      { status: 500 }
    );
  }
} 
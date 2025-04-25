import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/cloudinary';
import { createDocument } from '@/lib/db';

export async function POST(request) {
  console.log('Received upload request');
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const category = formData.get('category');

    console.log('Received form data:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      title,
      category
    });

    if (!file || !title) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      );
    }

    // Convert file to base64 for Cloudinary
    console.log('Converting file to base64');
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const base64File = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary');
    const cloudinaryResult = await uploadFile(base64File);
    console.log('Cloudinary upload result:', cloudinaryResult);

    // Save document metadata to database
    console.log('Saving to database');
    const document = await createDocument({
      title,
      category,
      file_url: cloudinaryResult.secure_url,
      file_type: file.type,
      file_size: file.size,
      public_id: cloudinaryResult.public_id
    });
    console.log('Document saved:', document);

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
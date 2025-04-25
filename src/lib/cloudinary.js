import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteFile(publicId) {
  try {
    console.log('Deleting file from Cloudinary:', publicId);
    await cloudinary.uploader.destroy(publicId);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
} 
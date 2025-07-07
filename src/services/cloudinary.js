import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true
});

// 🎯 Це storage для multer
export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'contacts',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

export const uploadImage = async (filePath, folder = 'contacts') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });
  return result.secure_url;
};

export const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

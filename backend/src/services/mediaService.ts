import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import env from "../config/env";

export const uploadProfileImageToCloudinary = async (fileBuffer: Buffer) => {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.uploadFolder,
        resource_type: "image",
      },
      (error, uploadResult) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(uploadResult);
      },
    );
    stream.end(fileBuffer);
  });

  return {
    secureUrl: result.secure_url as string,
    publicId: result.public_id as string,
  };
};

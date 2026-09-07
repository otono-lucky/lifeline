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

export const extractCloudinaryPublicId = (url: string): string | null => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    // Strip version prefix e.g. v1712345678/
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    // Strip file extension
    const dotIndex = withoutVersion.lastIndexOf(".");
    return dotIndex !== -1 ? withoutVersion.substring(0, dotIndex) : withoutVersion;
  } catch {
    return null;
  }
};

export const deleteImageFromCloudinary = async (publicIdOrUrl: string): Promise<boolean> => {
  if (!isCloudinaryConfigured || !publicIdOrUrl) {
    return false;
  }

  let publicId = publicIdOrUrl;
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    const extracted = extractCloudinaryPublicId(publicId);
    if (!extracted) return false;
    publicId = extracted;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return result?.result === "ok";
  } catch (error: any) {
    console.warn(`[Cloudinary] Failed to delete image (${publicId}):`, error?.message);
    return false;
  }
};

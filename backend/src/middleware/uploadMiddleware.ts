import multer from "multer";
import { errorResponse } from "../utils/responseHandler";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const imageFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"));
    return;
  }
  cb(null, true);
};

export const profileImageUpload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: imageFileFilter,
});

export const handleUploadError = (err, _req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json(errorResponse("Image too large. Maximum allowed size is 5MB."));
    }
    return res.status(400).json(errorResponse(err.message));
  }

  return res.status(400).json(errorResponse(err.message || "Invalid upload"));
};

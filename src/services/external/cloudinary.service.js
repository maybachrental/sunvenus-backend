const cloudinary = require("../../config/cloudinary");
const streamifier = require("streamifier");
const { v4: uuidv4 } = require("uuid");

class CloudinaryService {
  static allowedMimeTypes = {
    image: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
    video: ["video/mp4", "video/mpeg", "video/quicktime"],
    raw: ["application/pdf", "application/zip"],
  };

  static validateFile(file, resourceType = "image") {
    if (!file) throw new Error("File is required");

    const allowed = this.allowedMimeTypes[resourceType] || [];
    if (!allowed.includes(file.mimetype)) {
      throw new Error(`Invalid file type: ${file.mimetype}`);
    }
  }

  // Upload
  static async upload(file, folder = "uploads", options = {}) {
    const { resourceType = "auto", overwrite = false, useUUID = true, publicId = null, transformations = {} } = options;

    this.validateFile(file, resourceType === "auto" ? "image" : resourceType);

    const fileName = useUUID ? uuidv4() : publicId;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          public_id: fileName,
          overwrite,
          ...transformations,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // Delete File
  static async delete(publicId, resourceType = "image") {
    if (!publicId) throw new Error("publicId is required");

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // clears CDN cache
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error("Failed to delete file from Cloudinary");
    }

    return result;
  }

  static async deleteMultiple(publicIds = [], resourceType = "image") {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      throw new Error("publicIds array is required");
    }

    return await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
      invalidate: true,
    });
  }
   
  static async deleteFolder(folderPath, resourceType = "image") {
    if (!folderPath) {
      throw new Error("folderPath is required");
    }

    // Delete all assets inside folder
    await cloudinary.api.delete_resources_by_prefix(folderPath, {
      resource_type: resourceType,
      invalidate: true,
    });

    // Remove folder
    return await cloudinary.api.delete_folder(folderPath);
  }

  // Generate Signed Upload Params (for frontend direct upload)
  static generateSignedUpload(folder = "uploads") {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET,
    );

    return {
      timestamp,
      signature,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      folder,
    };
  }

  // Get Optimized URL
  static getUrl(publicId, transformations = {}) {
    return cloudinary.url(publicId, {
      secure: true,
      ...transformations,
    });
  }
}

module.exports = CloudinaryService;

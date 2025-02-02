const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;

// Configure cloudinary
cloudinary.config({
  cloud_name: 'davatfmiu',
  api_key: '426948767243662',
  api_secret: 'hT5dBSDGvu4fucBiKY10tQ94mXE'
});

const uploadToCloudinary = async (file, folder) => {
  try {
    // Read file from disk since multer already saved it
    const fileBuffer = await fs.readFile(file.path);
    
    // Convert file buffer to base64
    const fileStr = `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`;
    
    // Upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: folder,
      resource_type: 'auto'
    });

    // Delete temporary file
    await fs.unlink(file.path);

    return {
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    // Try to delete temporary file even if upload failed
    try {
      if (file.path) {
        await fs.unlink(file.path);
      }
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
    }
    throw new Error('Failed to upload file');
  }
};

const deleteFromCloudinary = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
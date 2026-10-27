import ImageKit from '@imagekit/nodejs';
import dotenv from 'dotenv';

dotenv.config();

// Ensure ImageKit does not throw if environment variables are not yet populated
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || 'dummy_private_key_until_configured';
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || '';
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || '';

const imagekit = new ImageKit({
  privateKey,
  publicKey,
  urlEndpoint,
});

/**
 * Check if actual ImageKit credentials have been provided in the environment.
 */
export const isImageKitConfigured = () => {
  const key = process.env.IMAGEKIT_PRIVATE_KEY;
  return Boolean(
    key &&
    key.trim() !== '' &&
    key !== 'dummy_private_key_until_configured' &&
    !key.includes('your_')
  );
};

/**
 * Safely delete an existing asset from ImageKit by fileId or by ImageKit URL.
 * Automatically catches and logs errors without failing the calling request.
 */
export const deleteFromImageKit = async (fileIdOrUrl, isDemo = false) => {
  if (!fileIdOrUrl || !isImageKitConfigured() || isDemo) return false;

  try {
    const target = String(fileIdOrUrl).trim();
    if (target.startsWith('demo') || target.includes('demo') || target.includes('dummy')) {
      console.log(`🛡️ ImageKit deletion skipped for demo asset: ${target}`);
      return true;
    }

    // 1. If it's a direct fileId (not a URL and doesn't contain slashes)
    if (!target.startsWith('http') && !target.includes('/')) {
      await imagekit.files.delete(target);
      console.log(`✓ Deleted old asset from ImageKit (fileId: ${target})`);
      return true;
    }

    // 2. If it's an ImageKit URL, extract filename and find matching asset to delete
    if (target.includes('ik.imagekit.io')) {
      try {
        const urlObj = new URL(target);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        const rawFileName = pathSegments[pathSegments.length - 1];

        if (rawFileName) {
          // Remove query params or transformations from fileName
          const fileName = rawFileName.split('?')[0];

          let assets = await imagekit.assets.list({
            searchQuery: `name = ${fileName}`
          }).catch(() => null);

          if (!assets || !Array.isArray(assets) || assets.length === 0) {
            assets = await imagekit.assets.list({
              searchQuery: `name="${fileName}"`
            }).catch(() => null);
          }

          if (Array.isArray(assets) && assets.length > 0 && assets[0]?.fileId) {
            await imagekit.files.delete(assets[0].fileId);
            console.log(`✓ Deleted old asset from ImageKit by URL lookup: ${fileName} (fileId: ${assets[0].fileId})`);
            return true;
          }
        }
      } catch (lookupErr) {
        console.warn('Note on ImageKit asset URL lookup for deletion:', lookupErr.message);
      }
    }
  } catch (err) {
    console.warn(`Note: Could not delete old ImageKit file (${fileIdOrUrl}):`, err.message);
  }
  return false;
};

export default imagekit;

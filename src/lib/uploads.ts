import path from 'path'
import { unlink } from 'fs/promises'

const UPLOAD_DIR_NAME = 'uploads'

/**
 * Returns the absolute path to the public uploads directory.
 */
export function getUploadDir() {
  return path.join(process.cwd(), 'public', UPLOAD_DIR_NAME)
}

/**
 * Converts a public URL (e.g. /uploads/image.jpg) or a filename to an absolute disk path.
 * Returns null if the input is invalid or attempts to escape the upload directory.
 * This function enforces a flat upload directory structure.
 */
export function getDiskPath(publicUrlOrFilename: string): string | null {
  if (!publicUrlOrFilename) return null

  let cleanName = publicUrlOrFilename

  // Remove leading URL path components if present
  if (cleanName.startsWith(`/${UPLOAD_DIR_NAME}/`)) {
    cleanName = cleanName.substring(UPLOAD_DIR_NAME.length + 2)
  } else if (cleanName.startsWith(`${UPLOAD_DIR_NAME}/`)) {
    cleanName = cleanName.substring(UPLOAD_DIR_NAME.length + 1)
  }

  // Reject if it still contains path separators (enforcing flat structure)
  if (cleanName.includes('/') || cleanName.includes('\\')) {
    return null
  }

  const basename = path.basename(cleanName)
  // Double check against traversal characters
  if (!basename || basename === '.' || basename === '..') return null

  return path.join(getUploadDir(), basename)
}

/**
 * Returns the public URL path for a filename.
 */
export function getPublicUrl(filename: string) {
  return `/${UPLOAD_DIR_NAME}/${filename}`
}

/**
 * Safely deletes an uploaded file.
 * Returns true if deleted, false if not found or failed.
 * Logs unexpected errors but swallows ENOENT.
 */
export async function deleteUpload(publicUrlOrFilename?: string | null) {
  if (!publicUrlOrFilename) return false
  
  const diskPath = getDiskPath(publicUrlOrFilename)
  if (!diskPath) return false

  try {
    await unlink(diskPath)
    return true
  } catch (error) {
    // Ignore error if file doesn't exist (ENOENT)
    if ((error as { code?: string }).code !== 'ENOENT') {
      console.error(`Failed to delete upload: ${diskPath}`, error)
    }
    return false
  }
}

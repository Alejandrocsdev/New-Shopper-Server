const multer = require('multer')
const path = require('path')

// file system can be different in server platforms (use static folder)

// const fs = require('fs')
// if (!fs.existsSync('storage/cloud/cloudinary/temp/')) {
//   console.log('Directory does not exist. Creating now...')
//   fs.mkdirSync('storage/cloud/cloudinary/temp/', { recursive: true })
//   console.log('Directory created:', fs.existsSync('storage/cloud/cloudinary/temp/'))
// }

const storage = storagePath => {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, storagePath),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  })
}

// MAX 3 MB
const fileSize = 3 * 1024 * 1024

const localUpload = multer({ storage: storage('storage/local/images/'), limits: { fileSize } })
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize } })
// const tempUpload = multer({ storage: storage('storage/cloud/cloudinary/temp/'), limits: { fileSize } })
const directUpload = multer({ limits: { fileSize } })

function upload(type) {
  switch (true) {
    case type === 'local':
      return localUpload.single('image')
    case type === 'cloudinary':
      return memoryUpload.single('image')
    case type === 'imgur':
      return directUpload.single('image')
  }
}

module.exports = upload

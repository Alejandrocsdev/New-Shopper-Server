const multer = require('multer')
const path = require('path')

const storage = (storagePath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storagePath)
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  })
}

// MAX 3 MB
const fileSize = 3 * 1024 * 1024

const localUpload = multer({ storage: storage('storage/local/images/'), limits: { fileSize } })
const tempUpload = multer({ storage: storage('storage/cloud/cloudinary/temp/'), limits: { fileSize } })
const directUpload = multer({ limits: { fileSize } })

function upload(type) {
  switch (true) {
    case type === 'local':
      return localUpload.single('image')
      break
    case type === 'cloudinary':
      return tempUpload.single('image')
      break
    case type === 'imgur':
      return directUpload.single('image')
      break
  }
}

module.exports = upload

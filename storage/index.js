const local = require('./local')
const imgur = require('./cloud/imgur')
const cloudinary = require('./cloud/cloudinary')

function uploadImage(file, type, options) {
  switch (true) {
    case type === 'local':
      return local.upload(file, options)
    case type === 'imgur':
      return imgur.upload(file)
    case type === 'cloudinary':
      return cloudinary.upload(file)
  }
}

function deleteImage(deleteData, type) {
  switch (true) {
    case type === 'local':
      return local.delete(deleteData)
    case type === 'imgur':
      return imgur.delete(deleteData)
    case type === 'cloudinary':
      return cloudinary.delete(deleteData)
  }
}

module.exports = { uploadImage, deleteImage }

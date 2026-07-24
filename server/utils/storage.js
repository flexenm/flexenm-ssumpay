const AWS = require('aws-sdk')
const FileType = require('file-type')
const { v4: uuidv4 } = require('uuid')

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com')
const region = 'kr-standard'
const BUCKET = process.env.NCP_BUCKET || 'ssumpay-images'
const CDN_DOMAIN = process.env.NCP_CDN_DOMAIN || `https://kr.object.ncloudstorage.com/${BUCKET}`

function createS3() {
  return new AWS.S3({
    endpoint,
    region,
    accessKeyId: process.env.NCP_ACCESS_KEY,
    secretAccessKey: process.env.NCP_SECRET_KEY,
  })
}

async function uploadInquiryImage(buffer) {
  if (buffer.length > MAX_SIZE) {
    throw Object.assign(new Error('이미지 크기는 5MB 이하여야 합니다.'), { status: 400 })
  }

  const type = await FileType.fromBuffer(buffer)
  if (!type || !ALLOWED_MIME.has(type.mime)) {
    throw Object.assign(new Error('JPG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.'), { status: 400 })
  }

  const ext = type.ext === 'jpg' ? 'jpg' : type.ext
  const key = `inquiry/${uuidv4()}.${ext}`

  const S3 = createS3()
  await S3.putObject({
    Bucket: BUCKET,
    Key: key,
    ACL: 'public-read',
    Body: buffer,
    ContentType: type.mime,
  }).promise()

  return `${CDN_DOMAIN}/${key}`
}

module.exports = { uploadInquiryImage }

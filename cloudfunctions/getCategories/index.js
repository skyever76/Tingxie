const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { type, parentId, lang } = event
  const where = { }
  if (type) where.type = type
  if (parentId !== undefined) where.parentId = parentId
  const collection = lang === 'en' ? 'english_categories' : 'chinese_categories'
  return await db.collection(collection).where(where).orderBy('order', 'asc').get()
} 
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { categoryId, lang } = event
  const collection = lang === 'en' ? 'english_lists' : 'chinese_texts'
  return await db.collection(collection).where({ categoryId }).get()
} 
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { name, words } = event

  if (!name) {
    return {
      success: false,
      error: '缺少词库名称'
    }
  }

  try {
    const now = new Date()
    const result = await db.collection('word_lists').add({
      data: {
        name,
        words: words || [],
        createdAt: now,
        updatedAt: now,
        _openid: wxContext.OPENID
      }
    })
    return {
      success: true,
      id: result._id
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
} 
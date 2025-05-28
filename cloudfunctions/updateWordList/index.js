// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { id, name, description, words, category, isPublic } = event

  if (!id) {
    return {
      success: false,
      error: '缺少词表ID'
    }
  }

  try {
    // 检查权限
    const wordList = await db.collection('word_lists')
      .doc(id)
      .get()

    if (wordList.data._openid !== wxContext.OPENID) {
      return {
        success: false,
        error: '无权修改该词表'
      }
    }

    // 构建更新数据
    const updateData = {
      updatedAt: db.serverDate()
    }

    if (name) updateData.name = name
    if (description) updateData.description = description
    if (words) {
      updateData.words = words
      updateData.totalWords = words.length
    }
    if (category) updateData.category = category
    if (typeof isPublic === 'boolean') updateData.isPublic = isPublic

    // 更新词表
    await db.collection('word_lists')
      .doc(id)
      .update({
        data: updateData
      })

    return {
      success: true
    }
  } catch (error) {
    console.error('更新词表失败', error)
    return {
      success: false,
      error: error.message || '更新词表失败'
    }
  }
} 
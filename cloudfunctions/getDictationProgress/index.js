// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { wordListId } = event

  if (!wordListId) {
    return {
      success: false,
      error: '缺少词表ID'
    }
  }

  try {
    // 获取听写记录
    const result = await db.collection('dictation_records')
      .where({
        _openid: wxContext.OPENID,
        wordListId: wordListId
      })
      .orderBy('completedAt', 'desc')
      .limit(1)
      .get()

    if (result.data.length === 0) {
      return {
        success: true,
        data: {
          completedWords: 0,
          accuracy: 0,
          timeSpent: 0,
          mistakes: []
        }
      }
    }

    return {
      success: true,
      data: result.data[0]
    }
  } catch (error) {
    console.error('获取听写进度失败', error)
    return {
      success: false,
      error: error.message || '获取听写进度失败'
    }
  }
} 
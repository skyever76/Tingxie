// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { 
    wordListId, 
    wordListName,
    totalWords,
    completedWords,
    accuracy,
    timeSpent,
    mistakes
  } = event

  if (!wordListId) {
    return {
      success: false,
      error: '缺少词表ID'
    }
  }

  try {
    // 创建听写记录
    const result = await db.collection('dictation_records').add({
      data: {
        _openid: wxContext.OPENID,
        wordListId,
        wordListName,
        totalWords,
        completedWords,
        accuracy,
        timeSpent,
        mistakes,
        completedAt: db.serverDate()
      }
    })

    return {
      success: true,
      data: {
        id: result._id
      }
    }
  } catch (error) {
    console.error('更新听写进度失败', error)
    return {
      success: false,
      error: error.message || '更新听写进度失败'
    }
  }
} 
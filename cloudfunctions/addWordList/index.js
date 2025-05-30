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
    name,
    description,
    words,
    isPublic = false,
    category = 'default',
    tags = []
  } = event

  if (!name) {
    return {
      success: false,
      error: '缺少词库名称'
    }
  }

  try {
    // 创建词库
    const result = await db.collection('word_lists').add({
      data: {
        _openid: wxContext.OPENID,
        name,
        description,
        words,
        isPublic,
        category,
        tags,
        downloadCount: 0,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      data: {
        id: result._id
      }
    }
  } catch (error) {
    console.error('创建词库失败:', error)
    return {
      success: false,
      message: '创建词库失败',
      error: error
    }
  }
} 
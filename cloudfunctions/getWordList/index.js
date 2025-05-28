// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { id } = event

  if (!id) {
    return {
      success: false,
      error: '缺少词表ID'
    }
  }

  try {
    // 获取词表详情
    const result = await db.collection('word_lists')
      .doc(id)
      .get()

    // 检查权限
    if (result.data._openid !== wxContext.OPENID && !result.data.isPublic) {
      return {
        success: false,
        error: '无权访问该词表'
      }
    }

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取词表失败', error)
    return {
      success: false,
      error: error.message || '获取词表失败'
    }
  }
} 
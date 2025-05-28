// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-5g9mvzy25122e260'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { id } = event
  
  try {
    // 检查词库是否存在且属于当前用户
    const wordList = await db.collection('word_lists')
      .doc(id)
      .get()
    
    if (!wordList.data) {
      return {
        success: false,
        error: '词库不存在'
      }
    }
    
    if (wordList.data._openid !== wxContext.OPENID) {
      return {
        success: false,
        error: '无权删除此词库'
      }
    }
    
    // 删除词库
    await db.collection('word_lists')
      .doc(id)
      .remove()
    
    return {
      success: true
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: error.message
    }
  }
} 
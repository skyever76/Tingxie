// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { 
    wordListId,
    wordListName,
    totalWords,
    completedWords,
    timeSpent
  } = event

  try {
    // 创建新记录
    await db.collection('progress').add({
      data: {
        _openid: wxContext.OPENID,
        wordListId,
        wordListName,
        totalWords,
        completedWords,
        timeSpent,
        createTime: db.serverDate()
      }
    })

    // 获取该用户的所有记录
    const records = await db.collection('progress')
      .where({
        _openid: wxContext.OPENID
      })
      .orderBy('createTime', 'desc')
      .get()

    // 如果记录超过5条，删除多余的记录
    if (records.data.length > 5) {
      const deleteIds = records.data.slice(5).map(record => record._id)
      await db.collection('progress').where({
        _id: _.in(deleteIds)
      }).remove()
    }

    return {
      success: true,
      message: '进度更新成功'
    }
  } catch (error) {
    console.error('更新进度失败:', error)
    return {
      success: false,
      message: '更新进度失败',
      error: error
    }
  }
} 
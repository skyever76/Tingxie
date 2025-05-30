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

  try {
    // 获取要下载的词库
    const wordList = await db.collection('word_lists').doc(wordListId).get()
    if (!wordList.data) {
      return {
        success: false,
        message: '词库不存在'
      }
    }

    // 检查权限
    if (!wordList.data.isPublic && wordList.data._openid !== wxContext.OPENID) {
      return {
        success: false,
        message: '无权下载该词库'
      }
    }

    // 创建个人词库副本
    const result = await db.collection('word_lists').add({
      data: {
        _openid: wxContext.OPENID,
        name: wordList.data.name,
        description: wordList.data.description,
        words: wordList.data.words,
        isPublic: false,
        category: wordList.data.category,
        tags: wordList.data.tags,
        sourceId: wordListId,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    // 更新原词库下载次数
    await db.collection('word_lists').doc(wordListId).update({
      data: {
        downloadCount: db.command.inc(1)
      }
    })

    return {
      success: true,
      data: {
        id: result._id
      }
    }
  } catch (error) {
    console.error('下载词库失败:', error)
    return {
      success: false,
      message: '下载词库失败',
      error: error
    }
  }
} 
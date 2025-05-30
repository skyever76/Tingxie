// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('开始删除重复词库')
  
  const wxContext = cloud.getWXContext()
  
  try {
    // 获取用户的所有词库
    const result = await db.collection('word_lists')
      .where({
        _openid: wxContext.OPENID
      })
      .get()
    
    const wordLists = result.data
    console.log('获取到词库列表:', wordLists)
    
    if (!wordLists || wordLists.length === 0) {
      return {
        success: true,
        message: '没有找到词库'
      }
    }
    
    // 按名称和年级分组
    const groups = {}
    wordLists.forEach(list => {
      const key = `${list.name}_${list.grade || ''}_${list.type || ''}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(list)
    })
    
    // 找出重复的词库
    const duplicates = []
    Object.values(groups).forEach(group => {
      if (group.length > 1) {
        // 按创建时间排序，保留最新的
        group.sort((a, b) => {
          const timeA = a.createTime || 0
          const timeB = b.createTime || 0
          return timeB - timeA
        })
        // 将除最新外的都标记为重复
        duplicates.push(...group.slice(1))
      }
    })
    
    console.log('找到重复词库:', duplicates)
    
    if (duplicates.length === 0) {
      return {
        success: true,
        message: '没有找到重复的词库'
      }
    }
    
    // 删除重复的词库
    const deletePromises = duplicates.map(async list => {
      try {
        const deleteResult = await db.collection('word_lists').doc(list._id).remove()
        console.log('删除词库成功:', list._id, deleteResult)
        return deleteResult
      } catch (error) {
        console.error('删除词库失败:', list._id, error)
        throw error
      }
    })
    
    const deleteResults = await Promise.all(deletePromises)
    console.log('删除结果:', deleteResults)
    
    return {
      success: true,
      message: `成功删除 ${duplicates.length} 个重复词库`,
      deletedCount: duplicates.length
    }
  } catch (error) {
    console.error('删除重复词库失败:', error)
    return {
      success: false,
      error: error.message || '删除失败，请稍后重试'
    }
  }
} 
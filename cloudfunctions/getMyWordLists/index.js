// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('收到获取词库列表请求:', event)
  
  const wxContext = cloud.getWXContext()
  const { category, grade, type } = event
  
  try {
    // 构建查询条件
    let query = db.collection('word_lists').where({
      _openid: wxContext.OPENID
    })
    
    // 如果指定了分类，添加分类条件
    if (category) {
      query = query.where({ mainCategory: category })
    }
    
    // 如果指定了年级，添加年级条件
    if (grade) {
      query = query.where({ grade })
    }
    
    // 如果指定了类型，添加类型条件
    if (type) {
      query = query.where({ type })
    }
    
    console.log('查询条件:', {
      _openid: wxContext.OPENID,
      mainCategory: category,
      grade,
      type
    })
    
    // 获取词库列表
    const result = await query
      .orderBy('createTime', 'desc')
      .get()
    
    console.log('查询结果:', result)
    
    let data = result.data
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('获取词库列表失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
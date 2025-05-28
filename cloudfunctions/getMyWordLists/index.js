// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-5g9mvzy25122e260'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { category, keyword } = event
  
  try {
    // 构建查询条件
    let query = db.collection('word_lists').where({
      _openid: wxContext.OPENID
    })
    
    // 如果指定了分类，添加分类条件
    if (category) {
      query = query.where({ category })
    }
    
    // 获取词库列表
    const result = await query
      .orderBy('updatedAt', 'desc')
      .get()
    
    let data = result.data
    
    // 如果有关键字，进行本地过滤
    if (keyword) {
      data = data.filter(item => 
        item.name.includes(keyword) || 
        item.description.includes(keyword)
      )
    }
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: error.message
    }
  }
} 
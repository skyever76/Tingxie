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
  console.log('收到获取词库请求:', event)
  
  const wxContext = cloud.getWXContext()
  const { id, query, type = 'personal', page = 1, pageSize = 10 } = event

  try {
    // 如果指定了ID，直接获取该词库
    if (id) {
      console.log('获取指定词库:', id)
      const result = await db.collection('word_lists').doc(id).get()
      console.log('获取词库结果:', result)
      
      if (!result.data) {
        return {
          success: false,
          error: '词库不存在'
        }
      }
      
      return {
        success: true,
        data: result.data
      }
    }

    // 构建查询条件
    let dbQuery = {}
    
    // 如果有查询条件，添加到查询中
    if (query) {
      // 转换查询条件字段名
      if (query.category === 'chinese') {
        dbQuery = {
          mainCategory: '中文词库',
          subCategory: query.grade
        }
      } else if (query.category === 'english') {
        dbQuery = {
          mainCategory: '英文词库',
          subCategory: query.type
        }
      }
    }
    
    // 根据类型添加额外的查询条件
    if (type === 'personal') {
      // 个人词库：创建者是自己
      dbQuery._openid = wxContext.OPENID
    } else if (type === 'public') {
      // 公共词库：已开放下载或已获得批准
      dbQuery = _.or([
        { isPublic: true },
        { approvedBy: wxContext.OPENID }
      ])
    }

    console.log('查询条件:', dbQuery)

    // 分页获取词库列表
    const result = await db.collection('word_lists')
      .where(dbQuery)
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    console.log('获取词库列表结果:', result)

    // 获取总数
    const countResult = await db.collection('word_lists')
      .where(dbQuery)
      .count()

    console.log('获取总数结果:', countResult)

    return {
      success: true,
      data: result.data,
      total: countResult.total,
      page,
      pageSize
    }
  } catch (error) {
    console.error('获取词库失败:', error)
    return {
      success: false,
      error: error.message || '获取词库失败'
    }
  }
} 
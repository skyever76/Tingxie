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
  const { id, type = 'personal', page = 1, pageSize = 10 } = event

  try {
    // 如果指定了ID，直接获取该词库
    if (id) {
      const result = await db.collection('word_lists').doc(id).get()
      return {
        success: true,
        data: result.data
      }
    }

    // 构建查询条件
    let query = {}
    if (type === 'personal') {
      // 个人词库：创建者是自己
      query._openid = wxContext.OPENID
    } else if (type === 'public') {
      // 公共词库：已开放下载或已获得批准
      query = _.or([
        { isPublic: true },
        { approvedBy: wxContext.OPENID }
      ])
    }

    // 分页获取词库列表
    const result = await db.collection('word_lists')
      .where(query)
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    // 获取总数
    const countResult = await db.collection('word_lists')
      .where(query)
      .count()

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
      message: '获取词库失败',
      error: error
    }
  }
} 
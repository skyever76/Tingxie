// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('收到创建词库请求:', event)
  
  const wxContext = cloud.getWXContext()
  const { 
    name,
    description,
    words,
    mainCategory,
    subCategory,
    grade
  } = event

  // 参数验证
  if (!name) {
    return {
      success: false,
      error: '缺少词库名称'
    }
  }

  if (!words || !Array.isArray(words) || words.length === 0) {
    return {
      success: false,
      error: '词语列表不能为空'
    }
  }

  if (!mainCategory || !subCategory) {
    return {
      success: false,
      error: '缺少分类信息'
    }
  }

  try {
    // 准备词库数据
    const wordListData = {
      _openid: wxContext.OPENID,
      name,
      description,
      words,
      mainCategory,
      subCategory,
      grade,
      downloadCount: 0,
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    console.log('准备创建词库:', wordListData)

    // 创建词库
    const result = await db.collection('word_lists').add({
      data: wordListData
    })

    console.log('词库创建成功:', result)

    // 验证创建结果
    if (!result._id) {
      throw new Error('创建词库失败：未返回词库ID')
    }

    // 查询确认词库是否真的创建成功
    const createdList = await db.collection('word_lists').doc(result._id).get()
    console.log('查询创建的词库:', createdList)

    if (!createdList.data) {
      throw new Error('创建词库失败：无法查询到新创建的词库')
    }

    // 查询该用户的所有词库
    const allLists = await db.collection('word_lists')
      .where({
        _openid: wxContext.OPENID
      })
      .get()
    console.log('用户的所有词库:', allLists)

    return {
      success: true,
      data: {
        id: result._id,
        wordList: createdList.data,
        totalLists: allLists.data.length
      }
    }
  } catch (error) {
    console.error('创建词库失败:', error)
    return {
      success: false,
      message: '创建词库失败',
      error: error.message || error
    }
  }
} 
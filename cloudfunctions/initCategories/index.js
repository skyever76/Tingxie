// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 示例数据
const chineseCategories = [
  { name: '小学一年级上', order: 1, parentId: null },
  { name: '小学一年级下', order: 2, parentId: null },
  { name: '小学二年级上', order: 3, parentId: null },
  // ... 可继续补充
]
const englishCategories = [
  { name: '小学英语', order: 1, parentId: null },
  { name: '中学英语', order: 2, parentId: null },
  { name: '小托福', order: 3, parentId: null },
  { name: '托福', order: 4, parentId: null },
]

exports.main = async (event, context) => {
  try {
    // 初始化中文目录
    for (const item of chineseCategories) {
      await db.collection('chinese_categories').add({ data: item })
    }
    // 初始化英文目录
    for (const item of englishCategories) {
      await db.collection('english_categories').add({ data: item })
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
} 
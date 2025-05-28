// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 示例数据
const chineseTexts = [
  { categoryId: '', title: '课文1', words: ['苹果', '香蕉'], order: 1 },
  { categoryId: '', title: '课文2', words: ['桌子', '椅子'], order: 2 },
]
const englishLists = [
  { categoryId: '', title: 'Unit 1', words: ['apple', 'banana'], order: 1 },
  { categoryId: '', title: 'Unit 2', words: ['table', 'chair'], order: 2 },
]

exports.main = async (event, context) => {
  try {
    // 这里categoryId需手动补充为实际的目录ID
    for (const item of chineseTexts) {
      await db.collection('chinese_texts').add({ data: item })
    }
    for (const item of englishLists) {
      await db.collection('english_lists').add({ data: item })
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
} 
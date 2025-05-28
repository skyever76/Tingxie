const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 将数据直接粘贴到这里，或通过event传递
const data = [
  { _id: 'grade1a', type: 'grade', name: '一年级上', parentId: null, order: 1 },
  { _id: 'grade1a_unit1', type: 'unit', name: '第一单元', parentId: 'grade1a', order: 1 },
  { _id: 'grade1a_unit2', type: 'unit', name: '第二单元', parentId: 'grade1a', order: 2 }
]

exports.main = async (event, context) => {
  const batchSize = 100
  let results = []
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    try {
      const res = await db.collection('chinese_categories').add({ data: batch })
      results.push(res)
    } catch (e) {
      results.push({ error: e })
    }
  }
  return results
} 
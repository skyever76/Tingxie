// import_chinese_categories.js
// 用于批量导入 chinese_categories.json 到云开发数据库
// 使用前请在本地安装 wx-server-sdk: npm install wx-server-sdk

const cloud = require('wx-server-sdk')
const fs = require('fs')

// 初始化云开发环境（请替换为你的环境ID）
cloud.init({ env: 'cloud1-5g9mvzy25122e260' })
const db = cloud.database()

async function main() {
  // 读取 JSON 文件
  const data = JSON.parse(fs.readFileSync(__dirname + '/chinese_categories.json', 'utf8'))
  // 分批写入（每批最多100条）
  const batchSize = 100
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    try {
      const res = await db.collection('chinese_categories').add({ data: batch })
      console.log(`成功写入第${i / batchSize + 1}批:`, res)
    } catch (e) {
      console.error(`第${i / batchSize + 1}批写入失败:`, e)
    }
  }
}

main() 
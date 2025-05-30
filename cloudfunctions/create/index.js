// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { type, content } = event
  const feedback = [] // 用于收集处理过程中的反馈信息

  if (!content || !content.trim()) {
    return {
      success: false,
      error: '内容不能为空'
    }
  }

  try {
    // 解析内容，支持按课文编号分组
    const lines = content.split('\n').filter(line => line.trim())
    const wordGroups = new Map() // 用于存储按课文编号分组的词语
    let currentLesson = '默认' // 默认课文编号

    feedback.push(`开始解析内容，共 ${lines.length} 行`)

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      // 检查是否是课文编号行
      const lessonMatch = trimmedLine.match(/^#\s*(\d+)/)
      if (lessonMatch) {
        currentLesson = `第${lessonMatch[1]}课`
        feedback.push(`发现课文标记：${currentLesson}`)
        continue
      }

      // 将词语添加到当前课文组
      if (!wordGroups.has(currentLesson)) {
        wordGroups.set(currentLesson, [])
        feedback.push(`创建新的课文组：${currentLesson}`)
      }

      // 分割词语（支持空格和逗号分隔）
      const words = trimmedLine.split(/[\s,]+/).filter(word => word.trim())
      if (words.length > 0) {
        wordGroups.get(currentLesson).push(...words)
        feedback.push(`向 ${currentLesson} 添加词语：${words.join(', ')}`)
      }
    }

    feedback.push(`解析完成，共 ${wordGroups.size} 个课文组`)

    // 为每个课文创建词库
    const results = []
    for (const [lesson, words] of wordGroups) {
      if (words.length === 0) {
        feedback.push(`跳过空课文组：${lesson}`)
        continue
      }

      feedback.push(`开始处理课文：${lesson}，包含 ${words.length} 个词语`)

      try {
        // 创建词库
        const wordListResult = await db.collection('wordlists').add({
          data: {
            name: lesson,
            description: `${type === 'chinese' ? '中文' : '英文'}词库 - ${lesson}`,
            type: type,
            totalWords: words.length,
            createTime: db.serverDate(),
            updateTime: db.serverDate(),
            _openid: wxContext.OPENID
          }
        })

        feedback.push(`成功创建词库：${lesson}`)

        // 添加词语
        const wordPromises = words.map(word => 
          db.collection('words').add({
            data: {
              word: word,
              definition: '',
              wordlistId: wordListResult._id,
              createTime: db.serverDate(),
              _openid: wxContext.OPENID
            }
          })
        )

        await Promise.all(wordPromises)
        feedback.push(`成功添加 ${words.length} 个词语到词库：${lesson}`)

        results.push({
          lesson,
          wordCount: words.length,
          wordListId: wordListResult._id
        })
      } catch (error) {
        feedback.push(`处理课文 ${lesson} 时出错：${error.message}`)
        throw error // 重新抛出错误，中断整个处理过程
      }
    }

    return {
      success: true,
      data: {
        results,
        totalLessons: results.length,
        totalWords: results.reduce((sum, r) => sum + r.wordCount, 0),
        feedback // 返回处理过程的反馈信息
      }
    }

  } catch (error) {
    console.error('创建词库失败:', error)
    return {
      success: false,
      error: error.message || '创建词库失败',
      feedback // 即使失败也返回已收集的反馈信息
    }
  }
} 
// 云函数入口文件
const cloud = require('wx-server-sdk')
const pinyin = require('pinyin')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('收到获取拼音请求:', event)
  
  const { words } = event
  
  try {
    if (!words || !Array.isArray(words)) {
      console.error('无效的词语列表:', words)
      return {
        success: false,
        error: '无效的词语列表'
      }
    }
    
    // 获取拼音
    const pinyinList = words.map(word => {
      try {
        if (!word || typeof word !== 'string') {
          console.error('无效的词语:', word)
          return ''
        }
        
        const py = pinyin(word, {
          style: pinyin.STYLE_NORMAL,
          heteronym: false
        })
        
        if (!py || !Array.isArray(py)) {
          console.error('拼音转换失败:', word)
          return ''
        }
        
        return py.map(p => p[0]).join(' ')
      } catch (error) {
        console.error('获取拼音失败:', word, error)
        return ''
      }
    })
    
    console.log('拼音结果:', pinyinList)
    
    return {
      success: true,
      data: pinyinList
    }
  } catch (error) {
    console.error('获取拼音失败:', error)
    return {
      success: false,
      error: error.message || '获取拼音失败'
    }
  }
} 
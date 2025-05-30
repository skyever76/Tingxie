// 云函数入口文件
const cloud = require('wx-server-sdk')
const { createWorker } = require('tesseract.js')
const sharp = require('sharp')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 图片预处理函数
async function preprocessImage(imageBuffer) {
  try {
    // 获取图片信息
    const metadata = await sharp(imageBuffer).metadata()
    
    // 根据图片尺寸调整处理参数
    const maxSize = Math.min(metadata.width, metadata.height) > 1000 ? 1500 : 1000
    
    return await sharp(imageBuffer)
      .resize(maxSize, maxSize, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .sharpen({
        sigma: 1.5, // 增加锐化强度
        m1: 1, // 亮部锐化
        m2: 0.5, // 暗部锐化
        x1: 2, // 锐化范围
        y2: 10, // 锐化阈值
        y3: 20 // 锐化阈值
      })
      .normalize() // 标准化
      .modulate({
        brightness: 1.1, // 略微提高亮度
        saturation: 1.2 // 增加饱和度
      })
      .toBuffer()
  } catch (error) {
    console.error('图片预处理失败:', error)
    throw new Error('图片预处理失败')
  }
}

// OCR识别函数
async function performOCR(imageBuffer) {
  let worker = null
  try {
    // 创建worker并设置超时
    worker = await createWorker({
      logger: m => console.log(m),
      errorHandler: err => console.error(err),
      timeout: 30000
    })

    // 只加载中英文语言包
    await worker.loadLanguage('chi_sim+eng')
    await worker.initialize('chi_sim+eng')

    // 优化识别参数
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?@#$%^&*()_+-=[]{}|;:"\'<>/\\ 中文汉字', // 添加中文字符
      tessedit_pageseg_mode: '1', // 自动页面分割
      preserve_interword_spaces: '1', // 保留词间空格
      tessedit_ocr_engine_mode: '1', // 使用LSTM引擎
      lstm_use_matrix: '1', // 使用矩阵
      lstm_choice_mode: '2', // 使用更准确的模式
      lstm_use_1d: '1', // 使用1D LSTM
      textord_heavy_nr: '1', // 更好的数字识别
      textord_min_linesize: '2.5', // 最小行高
      textord_max_linesize: '3.5' // 最大行高
    })

    // 执行识别
    const { data } = await worker.recognize(imageBuffer)
    return data
  } catch (error) {
    console.error('OCR识别失败:', error)
    throw new Error('OCR识别失败: ' + error.message)
  } finally {
    if (worker) {
      try {
        await worker.terminate()
      } catch (error) {
        console.error('Worker终止失败:', error)
      }
    }
  }
}

// 后处理识别结果
function postprocessResult(data) {
  // 清理文本
  let text = data.text
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/[^\S\n]+/g, ' ') // 保留换行，合并其他空白
    .trim()

  // 处理常见错误
  const corrections = {
    'l': 'I', // 小写L修正为大写I
    'O': '0', // 大写O修正为数字0
    'o': '0', // 小写o修正为数字0
    'rn': 'm', // rn修正为m
    'cl': 'd', // cl修正为d
    'vv': 'w' // vv修正为w
  }

  // 应用修正
  Object.entries(corrections).forEach(([wrong, correct]) => {
    text = text.replace(new RegExp(wrong, 'g'), correct)
  })

  return {
    text,
    confidence: data.confidence,
    words: data.words.map(word => ({
      text: word.text,
      confidence: word.confidence,
      bbox: word.bbox
    }))
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { fileID, options = {} } = event
  
  try {
    // 下载图片
    const { fileContent } = await cloud.downloadFile({
      fileID: fileID
    })

    // 检查文件大小
    if (fileContent.length > 10 * 1024 * 1024) {
      throw new Error('图片大小超过限制')
    }

    // 图片预处理
    const processedImage = await preprocessImage(fileContent)

    // OCR识别
    const data = await performOCR(processedImage)

    // 后处理结果
    const result = postprocessResult(data)

    // 检查识别结果
    if (!result.text) {
      throw new Error('未能识别出文字')
    }

    return {
      success: true,
      ...result
    }
  } catch (error) {
    console.error('OCR处理失败:', error)
    return {
      success: false,
      message: error.message || 'OCR处理失败',
      error: error.stack
    }
  }
} 
const app = getApp()

Page({
  data: {
    tempWordList: {
      name: '',
      words: []
    },
    isRecognizing: false,
    showPreview: false,
    previewWords: [],
    currentImages: [],
    historyList: [],
    showHistory: false,
    showWordList: false,
    tempWordLists: [],
    processingStep: '', // 处理步骤提示
    showProcessingTips: false // 是否显示处理提示
  },

  onLoad: function() {
    this.loadHistory()
    this.loadTempWordLists()
  },

  // 加载历史记录
  loadHistory: function() {
    const history = wx.getStorageSync('ocrHistory') || []
    this.setData({ historyList: history })
  },

  // 加载临时词库
  loadTempWordLists: function() {
    const tempWordLists = wx.getStorageSync('tempWordLists') || []
    this.setData({ tempWordLists })
  },

  // 拍照或选择图片
  chooseImage: function() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      camera: 'back',
      success: (res) => {
        const tempFiles = res.tempFiles
        this.setData({ 
          currentImages: tempFiles.map(file => file.tempFilePath)
        })
        this.recognizeText(tempFiles[0].tempFilePath)
      }
    })
  },

  // 显示处理步骤提示
  showProcessingStep: function(step) {
    this.setData({
      processingStep: step,
      showProcessingTips: true
    })
  },

  // 隐藏处理步骤提示
  hideProcessingTips: function() {
    this.setData({
      showProcessingTips: false
    })
  },

  // 图片预处理
  preprocessImage: function(imagePath) {
    return new Promise((resolve, reject) => {
      this.showProcessingStep('正在优化图片...')
      
      // 创建离屏canvas
      const query = wx.createSelectorQuery()
      query.select('#preprocessCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          
          // 加载图片
          const img = canvas.createImage()
          img.onload = () => {
            // 设置canvas大小
            canvas.width = img.width
            canvas.height = img.height
            
            // 绘制图片
            ctx.drawImage(img, 0, 0)
            
            // 获取图片数据
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            
            // 图像增强处理
            this.enhanceImage(imageData)
            
            // 将处理后的图片数据绘制回canvas
            ctx.putImageData(imageData, 0, 0)
            
            // 导出为临时文件
            wx.canvasToTempFilePath({
              canvas,
              success: (res) => {
                resolve(res.tempFilePath)
              },
              fail: reject
            })
          }
          img.onerror = reject
          img.src = imagePath
        })
    })
  },

  // 图像增强处理
  enhanceImage: function(imageData) {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    // 1. 对比度增强
    const contrast = 1.2
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] - 128) + 128
      data[i + 1] = factor * (data[i + 1] - 128) + 128
      data[i + 2] = factor * (data[i + 2] - 128) + 128
    }
    
    // 2. 二值化处理
    const threshold = 128
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
      const value = gray > threshold ? 255 : 0
      data[i] = data[i + 1] = data[i + 2] = value
    }
    
    // 3. 降噪处理
    this.removeNoise(data, width, height)
  },

  // 降噪处理
  removeNoise: function(data, width, height) {
    const temp = new Uint8ClampedArray(data)
    const threshold = 2
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        let count = 0
        
        // 检查周围8个像素
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const nidx = ((y + dy) * width + (x + dx)) * 4
            if (Math.abs(data[idx] - temp[nidx]) < threshold) {
              count++
            }
          }
        }
        
        // 如果周围像素差异太大，认为是噪点
        if (count < 4) {
          data[idx] = data[idx + 1] = data[idx + 2] = 255
        }
      }
    }
  },

  // 识别文字
  recognizeText: async function(imagePath) {
    this.setData({ isRecognizing: true })
    
    try {
      // 1. 图片预处理
      this.showProcessingStep('正在优化图片...')
      const processedImagePath = await this.preprocessImage(imagePath)
      
      // 2. 上传图片到云存储
      this.showProcessingStep('正在上传图片...')
      const cloudPath = `ocr/${Date.now()}.jpg`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: processedImagePath
      })
      
      // 3. 调用云函数进行文字识别
      this.showProcessingStep('正在识别文字...')
      const result = await wx.cloud.callFunction({
        name: 'recognizeText',
        data: { 
          fileID: uploadRes.fileID,
          options: {
            language: 'auto', // 自动检测语言
            probability: true // 返回置信度
          }
        }
      })
      
      if (result.result.success) {
        // 4. 处理识别结果
        this.showProcessingStep('正在优化识别结果...')
        const words = this.processRecognizedText(result.result.text, result.result.probability)
        
        this.setData({
          previewWords: words,
          showPreview: true,
          isRecognizing: false
        })
        
        // 5. 保存到历史记录
        this.saveToHistory(imagePath, words)
      } else {
        throw new Error(result.result.message)
      }
    } catch (err) {
      console.error('识别失败:', err)
      wx.showToast({
        title: '识别失败',
        icon: 'error'
      })
    } finally {
      this.setData({ isRecognizing: false })
      this.hideProcessingTips()
    }
  },

  // 处理识别出的文字
  processRecognizedText: function(text, probability) {
    // 1. 按行分割
    const lines = text.split('\n').filter(line => line.trim())
    
    // 2. 处理每一行
    return lines.map((line, index) => {
      // 尝试分割中英文
      const parts = line.split(/[：:]/)
      if (parts.length >= 2) {
        const word = parts[0].trim()
        const meaning = parts[1].trim()
        
        // 检查置信度
        const wordProb = probability[index] || 0
        if (wordProb < 0.8) {
          // 低置信度时进行纠错
          return {
            word: this.correctWord(word),
            meaning: meaning,
            original: word,
            confidence: wordProb
          }
        }
        
        return {
          word: word,
          meaning: meaning,
          confidence: wordProb
        }
      }
      
      // 如果没有分隔符，整行作为单词
      const word = line.trim()
      const wordProb = probability[index] || 0
      
      if (wordProb < 0.8) {
        return {
          word: this.correctWord(word),
          original: word,
          confidence: wordProb
        }
      }
      
      return {
        word: word,
        confidence: wordProb
      }
    }).filter(word => word.word) // 过滤空单词
  },

  // 单词纠错
  correctWord: function(word) {
    // 1. 常见错误修正
    const commonErrors = {
      'l': 'I',
      'O': '0',
      'o': '0',
      'rn': 'm',
      'cl': 'd'
    }
    
    let corrected = word
    for (const [error, correction] of Object.entries(commonErrors)) {
      corrected = corrected.replace(new RegExp(error, 'g'), correction)
    }
    
    // 2. 大小写修正
    if (corrected.length > 0) {
      // 如果全是大写，保持大写
      if (corrected === corrected.toUpperCase()) {
        return corrected
      }
      // 如果全是小写，首字母大写
      if (corrected === corrected.toLowerCase()) {
        return corrected.charAt(0).toUpperCase() + corrected.slice(1)
      }
    }
    
    return corrected
  },

  // 保存到历史记录
  saveToHistory: function(imagePath, words) {
    const history = wx.getStorageSync('ocrHistory') || []
    history.unshift({
      id: Date.now(),
      imagePath,
      words,
      createTime: new Date().toLocaleString()
    })
    // 只保留最近20条记录
    if (history.length > 20) {
      history.pop()
    }
    wx.setStorageSync('ocrHistory', history)
    this.setData({ historyList: history })
  },

  // 编辑单词
  editWord: function(e) {
    const { index } = e.currentTarget.dataset
    const { previewWords } = this.data
    const word = previewWords[index]
    
    wx.showModal({
      title: '编辑单词',
      content: '请输入单词和释义，用冒号分隔',
      editable: true,
      value: word.meaning ? `${word.word}:${word.meaning}` : word.word,
      success: (res) => {
        if (res.confirm && res.content) {
          const parts = res.content.split(/[：:]/)
          previewWords[index] = {
            word: parts[0].trim(),
            meaning: parts[1] ? parts[1].trim() : '',
            confidence: 1 // 手动编辑的置信度为1
          }
          this.setData({ previewWords })
        }
      }
    })
  },

  // 删除单词
  deleteWord: function(e) {
    const { index } = e.currentTarget.dataset
    const { previewWords } = this.data
    previewWords.splice(index, 1)
    this.setData({ previewWords })
  },

  // 确认创建词库
  confirmCreate: function() {
    const { previewWords } = this.data
    if (previewWords.length === 0) {
      wx.showToast({
        title: '请先识别文字',
        icon: 'none'
      })
      return
    }

    // 创建临时词库
    const tempWordList = {
      name: `临时词库_${new Date().toLocaleString()}`,
      words: previewWords
    }

    // 保存到本地存储
    const tempWordLists = wx.getStorageSync('tempWordLists') || []
    tempWordLists.unshift(tempWordList)
    wx.setStorageSync('tempWordLists', tempWordLists)
    this.setData({ tempWordLists })

    wx.showToast({
      title: '创建成功',
      icon: 'success'
    })

    // 跳转到听写页面
    wx.navigateTo({
      url: `/pages/dictation/dictation?type=temp&id=${tempWordList.name}`
    })
  },

  // 取消创建
  cancelCreate: function() {
    this.setData({
      showPreview: false,
      previewWords: [],
      currentImages: []
    })
  },

  // 显示历史记录
  showHistoryList: function() {
    this.setData({ showHistory: true })
  },

  // 隐藏历史记录
  hideHistory: function() {
    this.setData({ showHistory: false })
  },

  // 显示临时词库列表
  showTempWordLists: function() {
    this.setData({ showWordList: true })
  },

  // 隐藏临时词库列表
  hideTempWordLists: function() {
    this.setData({ showWordList: false })
  },

  // 删除历史记录
  deleteHistory: function(e) {
    const { id } = e.currentTarget.dataset
    const history = this.data.historyList.filter(item => item.id !== id)
    wx.setStorageSync('ocrHistory', history)
    this.setData({ historyList: history })
  },

  // 删除临时词库
  deleteTempWordList: function(e) {
    const { index } = e.currentTarget.dataset
    const tempWordLists = this.data.tempWordLists
    tempWordLists.splice(index, 1)
    wx.setStorageSync('tempWordLists', tempWordLists)
    this.setData({ tempWordLists })
  },

  // 使用历史记录
  useHistory: function(e) {
    const { words } = e.currentTarget.dataset
    this.setData({
      previewWords: words,
      showPreview: true,
      showHistory: false
    })
  },

  // 使用临时词库
  useTempWordList: function(e) {
    const { name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/dictation/dictation?type=temp&id=${name}`
    })
  }
}) 
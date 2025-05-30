const app = getApp()

Page({
  data: {
    wordList: {
      name: '',
      description: '',
      category: '',
      subCategory: '',
      isPublic: false,
      sections: []
    },
    currentSection: {
      title: '',
      content: ''
    },
    isEditing: false,
    uploadProgress: 0,
    isUploading: false,
    previewData: null,
    showPreview: false,
    selectedFiles: []
  },

  onLoad: function(options) {
    if (options.id) {
      this.loadWordList(options.id)
    }
  },

  // 加载词库
  loadWordList: function(id) {
    wx.showLoading({ title: '加载中...' })
    wx.cloud.callFunction({
      name: 'getWordList',
      data: { id }
    }).then(res => {
      if (res.result.success) {
        this.setData({
          wordList: res.result.data,
          isEditing: true
        })
      }
    }).catch(err => {
      console.error('加载词库失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 选择文件
  chooseFile: function() {
    wx.chooseMessageFile({
      count: 5, // 支持多选
      type: 'file',
      extension: ['xlsx', 'xls', 'txt'],
      success: (res) => {
        const tempFiles = res.tempFiles
        this.setData({
          selectedFiles: tempFiles
        })
        this.showPreviewModal(tempFiles)
      }
    })
  },

  // 显示预览弹窗
  showPreviewModal: function(files) {
    // 读取文件内容进行预览
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          filePath: file.path,
          encoding: 'utf-8',
          success: res => resolve({ file, content: res.data }),
          fail: reject
        })
      })
    })

    Promise.all(promises).then(results => {
      const previewData = results.map(({ file, content }) => {
        // 根据文件类型解析内容
        if (file.name.endsWith('.txt')) {
          return this.parseTxtContent(content, file.name)
        } else {
          // Excel文件需要上传到云端解析
          return { file, type: 'excel' }
        }
      })

      this.setData({
        previewData,
        showPreview: true
      })
    }).catch(err => {
      console.error('预览失败:', err)
      wx.showToast({
        title: '预览失败',
        icon: 'error'
      })
    })
  },

  // 解析TXT内容
  parseTxtContent: function(content, fileName) {
    const lines = content.split('\n').filter(line => line.trim())
    const words = lines.map(line => {
      const parts = line.split(/[：:]/)
      if (parts.length >= 2) {
        return {
          word: parts[0].trim(),
          meaning: parts[1].trim()
        }
      }
      return {
        word: line.trim()
      }
    })

    return {
      fileName,
      type: 'txt',
      words,
      wordCount: words.length
    }
  },

  // 确认导入
  confirmImport: function() {
    const { previewData } = this.data
    if (!previewData || previewData.length === 0) return

    this.setData({ isUploading: true, uploadProgress: 0 })
    
    // 处理每个文件
    const promises = previewData.map((data, index) => {
      if (data.type === 'excel') {
        return this.uploadFile(data.file)
      } else {
        // TXT文件直接创建章节
        return Promise.resolve({
          title: data.fileName.split('.')[0],
          words: data.words
        })
      }
    })

    Promise.all(promises).then(results => {
      // 合并所有章节
      const sections = results.map(result => {
        if (result.fileID) {
          // Excel文件需要等待云端解析
          return this.parseFile(result.fileID, result.fileName)
        }
        return result
      })

      // 更新词库数据
      this.setData({
        'wordList.sections': sections,
        showPreview: false,
        selectedFiles: [],
        previewData: null,
        isUploading: false
      })

      wx.showToast({
        title: '导入成功',
        icon: 'success'
      })
    }).catch(err => {
      console.error('导入失败:', err)
      wx.showToast({
        title: '导入失败',
        icon: 'error'
      })
      this.setData({ isUploading: false })
    })
  },

  // 取消导入
  cancelImport: function() {
    this.setData({
      showPreview: false,
      selectedFiles: [],
      previewData: null
    })
  },

  // 下载模板
  downloadTemplate: function() {
    wx.showLoading({ title: '准备下载...' })
    
    // 创建模板内容
    const template = {
      excel: {
        name: '词库模板.xlsx',
        content: [
          ['单词', '释义'],
          ['apple', '苹果'],
          ['banana', '香蕉']
        ]
      },
      txt: {
        name: '词库模板.txt',
        content: 'apple: 苹果\nbanana: 香蕉'
      }
    }

    // 下载Excel模板
    wx.cloud.callFunction({
      name: 'generateTemplate',
      data: { type: 'excel', content: template.excel.content }
    }).then(res => {
      if (res.result.success) {
        wx.downloadFile({
          url: res.result.fileID,
          success: res => {
            wx.openDocument({
              filePath: res.tempFilePath,
              showMenu: true
            })
          }
        })
      }
    }).catch(err => {
      console.error('下载模板失败:', err)
      wx.showToast({
        title: '下载失败',
        icon: 'error'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 上传文件
  uploadFile: function(file) {
    const cloudPath = `wordlists/${Date.now()}-${file.name}`
    
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath,
        filePath: file.path,
        success: res => resolve({ fileID: res.fileID, fileName: file.name }),
        fail: reject
      })
    })
  },

  // 解析文件内容
  parseFile: function(fileID, fileName) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'parseWordList',
        data: { fileID }
      }).then(res => {
        if (res.result.success) {
          resolve({
            title: fileName.split('.')[0],
            words: res.result.data.words
          })
        } else {
          reject(new Error(res.result.message))
        }
      }).catch(reject)
    })
  },

  // 输入词库基本信息
  onInput: function(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`wordList.${field}`]: value
    })
  },

  // 切换是否公开
  onPublicChange: function(e) {
    this.setData({
      'wordList.isPublic': e.detail.value
    })
  },

  // 添加新章节
  addSection: function() {
    const { currentSection, wordList } = this.data
    if (!currentSection.title || !currentSection.content) {
      wx.showToast({
        title: '请填写完整章节信息',
        icon: 'none'
      })
      return
    }

    // 处理内容为单词列表
    const words = this.processContent(currentSection.content)

    wordList.sections.push({
      title: currentSection.title,
      words: words
    })

    this.setData({
      wordList,
      currentSection: {
        title: '',
        content: ''
      }
    })
  },

  // 处理内容为单词列表
  processContent: function(content) {
    // 按行分割
    const lines = content.split('\n').filter(line => line.trim())
    
    // 处理每一行
    return lines.map(line => {
      // 尝试分割中英文
      const parts = line.split(/[：:]/)
      if (parts.length >= 2) {
        return {
          word: parts[0].trim(),
          meaning: parts[1].trim()
        }
      }
      // 如果没有分隔符，整行作为单词
      return {
        word: line.trim()
      }
    })
  },

  // 删除章节
  deleteSection: function(e) {
    const { index } = e.currentTarget.dataset
    const { wordList } = this.data
    wordList.sections.splice(index, 1)
    this.setData({ wordList })
  },

  // 保存词库
  saveWordList: function() {
    const { wordList, isEditing } = this.data

    // 验证基本信息
    if (!wordList.name) {
      wx.showToast({
        title: '请输入词库名称',
        icon: 'none'
      })
      return
    }

    // 验证是否有章节
    if (wordList.sections.length === 0) {
      wx.showToast({
        title: '请至少添加一个章节',
        icon: 'none'
      })
      return
    }

    // 合并所有章节的单词
    const allWords = wordList.sections.reduce((words, section) => {
      return words.concat(section.words)
    }, [])

    // 准备保存的数据
    const saveData = {
      ...wordList,
      words: allWords
    }

    wx.showLoading({ title: '保存中...' })

    // 调用云函数保存
    wx.cloud.callFunction({
      name: isEditing ? 'updateWordList' : 'addWordList',
      data: saveData
    }).then(res => {
      if (res.result.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(res.result.message)
      }
    }).catch(err => {
      console.error('保存词库失败:', err)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  }
}) 
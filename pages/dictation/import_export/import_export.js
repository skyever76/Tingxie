// 批量导入导出工具页面
const app = getApp()

Page({
  data: {
    importContent: '',
    formatOptions: ['文本格式', 'JSON格式'],
    formatIndex: 0,
    wordLists: [],
    wordListIndex: 0,
    showImportResult: false,
    importResult: ''
  },

  onLoad() {
    this.loadWordLists()
  },

  onShow() {
    this.loadWordLists()
  },

  // 加载词库列表
  async loadWordLists() {
    try {
      wx.showLoading({ title: '加载中' })
      const db = wx.cloud.database()
      const res = await db.collection('word_lists')
        .where({
          _openid: app.globalData.openid
        })
        .orderBy('createdAt', 'desc')
        .get()
      
      this.setData({
        wordLists: res.data
      })
    } catch (error) {
      console.error('加载词库失败：', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 导出格式选择
  handleFormatChange(e) {
    this.setData({
      formatIndex: e.detail.value
    })
  },

  // 词库选择
  handleWordListChange(e) {
    this.setData({
      wordListIndex: e.detail.value
    })
  },

  // 获取设置中的振动开关
  getVibrationSetting() {
    try {
      const settings = wx.getStorageSync('dictationSettings')
      return settings && settings.vibration !== undefined ? settings.vibration : true
    } catch {
      return true
    }
  },

  // 导入处理
  async handleImport() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    try {
      const { importContent, formatIndex } = this.data
      if (!importContent.trim()) {
        wx.showToast({
          title: '请输入要导入的内容',
          icon: 'none'
        })
        return
      }

      let words = []
      if (formatIndex === 0) {
        // 文本格式
        if (importContent.includes(',')) {
          words = importContent.split(',').map(word => word.trim())
        } else if (importContent.includes('\t')) {
          words = importContent.split('\t').map(word => word.trim())
        } else {
          words = importContent.split('\n').map(word => word.trim())
        }
      } else {
        // JSON格式
        try {
          const jsonData = JSON.parse(importContent)
          words = Array.isArray(jsonData) ? jsonData : [jsonData]
        } catch (error) {
          wx.showToast({
            title: 'JSON格式错误',
            icon: 'none'
          })
          return
        }
      }

      words = words.filter(word => word)

      if (words.length === 0) {
        wx.showToast({
          title: '未找到有效单词',
          icon: 'none'
        })
        return
      }

      // 保存到词库
      const db = wx.cloud.database()
      const result = await db.collection('word_lists').add({
        data: {
          name: '导入的词库',
          description: '通过批量导入创建',
          words: words,
          totalWords: words.length,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
          _openid: app.globalData.openid
        }
      })

      this.setData({
        showImportResult: true,
        importResult: `成功导入 ${words.length} 个单词`
      })

      // 刷新词库列表
      this.loadWordLists()
    } catch (error) {
      console.error('导入失败：', error)
      wx.showToast({
        title: '导入失败',
        icon: 'error'
      })
    }
  },

  // 清空输入
  handleClear() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    this.setData({
      importContent: ''
    })
  },

  // 导出处理
  async handleExport() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    try {
      const { wordLists, wordListIndex, formatIndex } = this.data
      const selectedList = wordLists[wordListIndex]
      
      if (!selectedList) {
        wx.showToast({
          title: '请选择要导出的词库',
          icon: 'none'
        })
        return
      }

      let exportContent = ''
      if (formatIndex === 0) {
        // 文本格式
        exportContent = selectedList.words.join('\n')
      } else {
        // JSON格式
        exportContent = JSON.stringify(selectedList, null, 2)
      }

      // 复制到剪贴板
      wx.setClipboardData({
        data: exportContent,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    } catch (error) {
      console.error('导出失败：', error)
      wx.showToast({
        title: '导出失败',
        icon: 'error'
      })
    }
  },

  // 复制到剪贴板
  handleCopy() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    this.handleExport()
  },

  // 关闭导入结果弹窗
  handleCloseImportResult() {
    this.setData({
      showImportResult: false,
      importContent: ''
    })
  }
}) 
// 词库管理页面
const app = getApp()

Page({
  data: {
    wordLists: [],
    showModal: false,
    showImportModal: false,
    isEdit: false,
    currentWordList: {
      name: '',
      description: '',
      words: []
    },
    wordInput: '',
    importInput: '',
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    showSkeleton: true
  },

  onLoad() {
    this.resetAndLoad()
  },

  onShow() {
    this.resetAndLoad()
  },

  // 重置分页并加载
  resetAndLoad() {
    this.setData({
      wordLists: [],
      page: 1,
      hasMore: true,
      showSkeleton: true
    })
    this.loadWordLists()
  },

  // 加载词库列表
  async loadWordLists() {
    if (this.data.loading || !this.data.hasMore) return
    this.setData({ loading: true })
    try {
      // 优先读取本地缓存第一页
      if (this.data.page === 1) {
        const cached = wx.getStorageSync('wordLists') || []
        if (cached.length > 0) {
          this.setData({ wordLists: cached, showSkeleton: false })
        }
      }
      wx.showLoading({ title: '加载中' })
      const db = wx.cloud.database()
      const res = await db.collection('word_lists')
        .where({
          _openid: app.globalData.openid
        })
        .orderBy('createdAt', 'desc')
        .get()
      this.setData({ wordLists: res.data })
      // 同步本地缓存
      wx.setStorageSync('wordLists', res.data)
    } catch (error) {
      console.error('加载词库失败：', error)
      if (error && error.errMsg && error.errMsg.indexOf('network') !== -1) {
        wx.showToast({ title: '网络异常，可下拉重试', icon: 'none' })
      } else {
        wx.showToast({ title: '操作失败，请重试', icon: 'none' })
      }
      // 失败时依然尝试用本地缓存
      const cached = wx.getStorageSync('wordLists') || []
      if (cached.length > 0) {
        this.setData({ wordLists: cached })
      }
    } finally {
      wx.hideLoading()
      this.setData({ loading: false })
      wx.stopPullDownRefresh && wx.stopPullDownRefresh()
    }
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

  // 新建词库
  handleAddWordList() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    this.setData({
      showModal: true,
      isEdit: false,
      currentWordList: {
        name: '',
        description: '',
        words: []
      },
      wordInput: ''
    })
  },

  // 编辑词库
  handleEdit(e) {
    const { id } = e.currentTarget.dataset
    const wordList = this.data.wordLists.find(item => item._id === id)
    if (wordList) {
      this.setData({
        showModal: true,
        isEdit: true,
        currentWordList: wordList,
        wordInput: wordList.words.join('\n')
      })
    }
  },

  // 删除词库
  async handleDelete(e) {
    if (this.getVibrationSetting()) wx.vibrateShort()
    const { id } = e.currentTarget.dataset
    try {
      const res = await wx.showModal({
        title: '确认删除',
        content: '确定要删除这个词库吗？'
      })
      
      if (res.confirm) {
        wx.showLoading({ title: '删除中' })
        const db = wx.cloud.database()
        await db.collection('word_lists').doc(id).remove()
        
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
        this.loadWordLists()
      }
    } catch (error) {
      console.error('删除词库失败：', error)
      if (error && error.errMsg && error.errMsg.indexOf('network') !== -1) {
        wx.showToast({ title: '网络异常，请重试', icon: 'none' })
      } else {
        wx.showToast({ title: '操作失败，请重试', icon: 'none' })
      }
    } finally {
      wx.hideLoading()
    }
  },

  // 保存词库
  async handleSaveWordList() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    try {
      const { currentWordList, wordInput, isEdit } = this.data
      
      if (!currentWordList.name.trim()) {
        wx.showToast({
          title: '请输入词库名称',
          icon: 'none'
        })
        return
      }

      const words = wordInput.split('\n')
        .map(word => word.trim())
        .filter(word => word)

      if (words.length === 0) {
        wx.showToast({
          title: '请输入单词',
          icon: 'none'
        })
        return
      }

      wx.showLoading({ title: '保存中' })
      const db = wx.cloud.database()
      
      if (isEdit) {
        await db.collection('word_lists').doc(currentWordList._id).update({
          data: {
            name: currentWordList.name,
            description: currentWordList.description,
            words: words,
            totalWords: words.length,
            updatedAt: db.serverDate()
          }
        })
      } else {
        await db.collection('word_lists').add({
          data: {
            name: currentWordList.name,
            description: currentWordList.description,
            words: words,
            totalWords: words.length,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate(),
            _openid: app.globalData.openid
          }
        })
      }

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      this.setData({
        showModal: false
      })

      this.loadWordLists()
    } catch (error) {
      console.error('保存词库失败：', error)
      if (error && error.errMsg && error.errMsg.indexOf('network') !== -1) {
        wx.showToast({ title: '网络异常，请重试', icon: 'none' })
      } else {
        wx.showToast({ title: '操作失败，请重试', icon: 'none' })
      }
    } finally {
      wx.hideLoading()
    }
  },

  // 关闭弹窗
  handleCloseModal() {
    this.setData({
      showModal: false
    })
  },

  // 打开导入弹窗
  handleImport() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    this.setData({
      showImportModal: true,
      importInput: ''
    })
  },

  // 关闭导入弹窗
  handleCloseImportModal() {
    this.setData({
      showImportModal: false
    })
  },

  // 确认导入
  async handleImportConfirm() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    try {
      const { importInput } = this.data
      if (!importInput.trim()) {
        wx.showToast({
          title: '请输入要导入的内容',
          icon: 'none'
        })
        return
      }

      // 尝试解析不同格式
      let words = []
      if (importInput.includes(',')) {
        words = importInput.split(',').map(word => word.trim())
      } else if (importInput.includes('\t')) {
        words = importInput.split('\t').map(word => word.trim())
      } else {
        try {
          const jsonData = JSON.parse(importInput)
          words = Array.isArray(jsonData) ? jsonData : [jsonData]
        } catch {
          words = importInput.split('\n').map(word => word.trim())
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

      this.setData({
        showImportModal: false,
        showModal: true,
        isEdit: false,
        currentWordList: {
          name: '导入的词库',
          description: '通过批量导入创建',
          words: []
        },
        wordInput: words.join('\n')
      })
    } catch (error) {
      console.error('导入失败：', error)
      if (error && error.errMsg && error.errMsg.indexOf('network') !== -1) {
        wx.showToast({ title: '网络异常，请重试', icon: 'none' })
      } else {
        wx.showToast({ title: '操作失败，请重试', icon: 'none' })
      }
    }
  },

  // 导出词库
  async handleExport() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    try {
      const { wordLists } = this.data
      if (wordLists.length === 0) {
        wx.showToast({
          title: '暂无词库可导出',
          icon: 'none'
        })
        return
      }

      const exportData = wordLists.map(list => ({
        name: list.name,
        description: list.description,
        words: list.words
      }))

      const jsonStr = JSON.stringify(exportData, null, 2)
      
      // 复制到剪贴板
      wx.setClipboardData({
        data: jsonStr,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        },
        fail: () => {
          wx.showToast({ title: '复制失败，请重试', icon: 'none' })
        }
      })
    } catch (error) {
      console.error('导出失败：', error)
      if (error && error.errMsg && error.errMsg.indexOf('network') !== -1) {
        wx.showToast({ title: '网络异常，请重试', icon: 'none' })
      } else {
        wx.showToast({ title: '操作失败，请重试', icon: 'none' })
      }
    }
  }
}) 
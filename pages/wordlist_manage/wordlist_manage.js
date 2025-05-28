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
    importInput: ''
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

  // 新建词库
  handleAddWordList() {
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
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 保存词库
  async handleSaveWordList() {
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
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
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
      wx.showToast({
        title: '导入失败',
        icon: 'error'
      })
    }
  },

  // 导出词库
  async handleExport() {
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
        }
      })
    } catch (error) {
      console.error('导出失败：', error)
      wx.showToast({
        title: '导出失败',
        icon: 'error'
      })
    }
  }
}) 
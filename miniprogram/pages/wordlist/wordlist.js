// wordlist.js
Page({
  data: {
    wordLists: [],
    loading: false,
    showImportModal: false,
    importType: 'chinese', // 'chinese' 或 'english'
    currentCategory: 'chinese', // 当前分类：chinese 或 english
    categories: {
      chinese: {
        name: '中文词库',
        grades: ['一年级上', '一年级下', '二年级上', '二年级下', '三年级上', '三年级下', '四年级上', '四年级下', '五年级上', '五年级下']
      },
      english: {
        name: '英文词库',
        types: ['小托福', '托福', 'SSAT', '其它']
      }
    }
  },

  onLoad: function() {
    this.loadWordLists()
  },

  onShow: function() {
    // 每次显示页面时刷新词库列表
    this.loadWordLists()
  },

  // 加载词库列表
  async loadWordLists() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMyWordLists',
        data: {
          category: this.data.currentCategory
        }
      })
      if (res.result && res.result.data) {
        this.setData({
          wordLists: res.result.data
        })
      }
    } catch (error) {
      console.error('加载词库列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 显示导入模态框
  showImportModal(type) {
    this.setData({
      showImportModal: true,
      importType: type
    })
  },

  // 隐藏导入模态框
  hideImportModal() {
    this.setData({
      showImportModal: false
    })
  },

  // 跳转到导入页面
  goToImport(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/create/create?type=${type}`
    })
  },

  // 删除词库
  async deleteWordList(e) {
    const { id } = e.currentTarget.dataset
    try {
      const res = await wx.showModal({
        title: '确认删除',
        content: '确定要删除这个词库吗？',
        confirmText: '删除',
        confirmColor: '#ff4d4f'
      })
      
      if (res.confirm) {
        wx.showLoading({ title: '删除中...' })
        const result = await wx.cloud.callFunction({
          name: 'deleteWordList',
          data: { id }
        })
        
        if (result.result && result.result.success) {
          wx.showToast({ title: '删除成功' })
          this.loadWordLists()
        } else {
          throw new Error(result.result?.error || '删除失败')
        }
      }
    } catch (error) {
      console.error('删除词库失败:', error)
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 跳转到词库详情页
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/wordlist-detail/wordlist-detail?id=${id}`
    })
  },

  // 切换分类
  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category
    }, () => {
      this.loadWordLists()
    })
  },

  // 跳转到创建词库页面
  goToCreate: function() {
    wx.navigateTo({
      url: `/pages/create/create?category=${this.data.currentCategory}`
    })
  },

  // 跳转到听写页面
  goToDictation: function(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/dictation/dictation?id=${id}`
    })
  },

  selectGrade: function(e) {
    const grade = e.currentTarget.dataset.grade
    this.setData({
      selectedGrade: grade
    }, () => {
      this.loadWordLists()
    })
  }
}) 
const app = getApp()

Page({
  data: {
    wordLists: [],
    currentType: 'personal', // personal 或 public
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true
  },

  onLoad: function() {
    this.loadWordLists()
  },

  // 切换词库类型
  switchType: function(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      currentType: type,
      wordLists: [],
      page: 1,
      hasMore: true
    })
    this.loadWordLists()
  },

  // 加载词库列表
  loadWordLists: function() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })

    wx.cloud.callFunction({
      name: 'getWordList',
      data: {
        type: this.data.currentType,
        page: this.data.page,
        pageSize: this.data.pageSize
      }
    }).then(res => {
      if (res.result.success) {
        const { data, total } = res.result
        const hasMore = this.data.wordLists.length + data.length < total
        
        this.setData({
          wordLists: [...this.data.wordLists, ...data],
          total,
          hasMore,
          page: this.data.page + 1
        })
      }
    }).catch(err => {
      console.error('加载词库失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }).finally(() => {
      this.setData({ loading: false })
      wx.hideLoading()
    })
  },

  // 下载词库
  downloadWordList: function(e) {
    const { id } = e.currentTarget.dataset
    wx.showLoading({ title: '下载中...' })

    wx.cloud.callFunction({
      name: 'downloadWordList',
      data: { wordListId: id }
    }).then(res => {
      if (res.result.success) {
        wx.showToast({
          title: '下载成功',
          icon: 'success'
        })
        // 刷新个人词库列表
        if (this.data.currentType === 'personal') {
          this.setData({
            wordLists: [],
            page: 1,
            hasMore: true
          })
          this.loadWordLists()
        }
      } else {
        wx.showToast({
          title: res.result.message || '下载失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      console.error('下载词库失败:', err)
      wx.showToast({
        title: '下载失败',
        icon: 'error'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 开始听写
  startDictation: function(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/dictation/dictation?id=${id}`
    })
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      wordLists: [],
      page: 1,
      hasMore: true
    })
    this.loadWordLists()
    wx.stopPullDownRefresh()
  },

  // 触底加载更多
  onReachBottom: function() {
    this.loadWordLists()
  }
}) 
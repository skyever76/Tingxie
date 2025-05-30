// wordlist.js
Page({
  data: {
    wordLists: [],
    loading: true,
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
    this.getWordLists()
  },

  onShow: function() {
    // 每次显示页面时刷新词库列表
    this.getWordLists()
  },

  // 获取词库列表
  getWordLists: function() {
    this.setData({ loading: true })
    wx.cloud.callFunction({
      name: 'getMyWordLists',
      data: {
        category: this.data.currentCategory,
        grade: this.data.selectedGrade
      },
      success: res => {
        this.setData({
          wordLists: res.result.data || [],
          loading: false
        })
      },
      fail: err => {
        console.error('获取词库列表失败', err)
        wx.showToast({
          title: '获取词库列表失败',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    })
  },

  // 切换分类
  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category
    }, () => {
      this.getWordLists()
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

  // 删除词库
  deleteWordList: function(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个词库吗？',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'deleteWordList',
            data: { id },
            success: res => {
              if (res.result.success) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.getWordLists()
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                })
              }
            },
            fail: err => {
              console.error('删除词库失败', err)
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  selectGrade: function(e) {
    const grade = e.currentTarget.dataset.grade;
    this.setData({
      selectedGrade: grade
    }, () => {
      this.getWordLists();
    });
  }
}) 
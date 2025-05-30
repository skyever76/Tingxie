// wordlist.js
Page({
  data: {
    wordLists: [],
    loading: false,
    showImportModal: false,
    importType: 'chinese', // 'chinese' 或 'english'
    currentCategory: 'chinese', // 当前分类：chinese 或 english
    selectedGrade: '', // 当前选中的年级
    selectedType: '', // 当前选中的类型
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
    // 初始加载时不获取词库列表
    this.setData({
      wordLists: []
    })
  },

  onShow: function() {
    // 如果已经选择了二级目录，则刷新词库列表
    if (this.data.selectedGrade || this.data.selectedType) {
      this.loadWordLists()
    } else {
      this.setData({
        wordLists: []
      })
    }
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      selectedGrade: '',
      selectedType: '',
      wordLists: []
    })
  },

  // 选择年级
  selectGrade(e) {
    const grade = e.currentTarget.dataset.grade
    this.setData({
      selectedGrade: grade,
      wordLists: []
    })
    this.loadWordLists()
  },

  // 选择类型
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedType: type,
      wordLists: []
    })
    this.loadWordLists()
  },

  // 加载词库列表
  loadWordLists() {
    if (!this.data.selectedGrade && !this.data.selectedType) {
        this.setData({ wordLists: [] })
        return
    }

    this.setData({ loading: true })
    
    // 构建查询条件
    const query = {
        category: this.data.currentCategory,
        ...(this.data.currentCategory === 'chinese' 
            ? { grade: this.data.selectedGrade }
            : { type: this.data.selectedType }
        )
    }
    
    console.log('查询条件:', query)
    
    wx.cloud.callFunction({
        name: 'getWordList',
        data: { query },
        success: res => {
            console.log('获取词库列表结果:', res)
            if (res.result && res.result.success) {
                const wordLists = res.result.data || []
                console.log('更新词库列表:', wordLists)
                
                // 处理词库数据
                const processedLists = wordLists.map(list => ({
                    ...list,
                    wordCount: list.words ? list.words.length : 0,
                    createTime: list.createTime ? new Date(list.createTime).toLocaleDateString() : '',
                    updateTime: list.updateTime ? new Date(list.updateTime).toLocaleDateString() : ''
                }))
                
                this.setData({ 
                    wordLists: processedLists,
                    loading: false
                })
            } else {
                console.error('获取词库列表失败:', res.result?.error || '未知错误')
                wx.showToast({
                    title: res.result?.error || '获取词库列表失败',
                    icon: 'none'
                })
                this.setData({ loading: false })
            }
        },
        fail: err => {
            console.error('获取词库列表失败:', err)
            wx.showToast({
                title: '获取词库列表失败',
                icon: 'none'
            })
            this.setData({ loading: false })
        }
    })
  },

  // 跳转到听写页面
  goToDictation(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/dictation/dictation?id=${id}`
    })
  },

  // 删除词库
  async deleteWordList(e) {
    const id = e.currentTarget.dataset.id
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
                wx.showToast({
                    title: '删除成功',
                    icon: 'success'
                })
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

  // 删除重复词库
  async deleteDuplicates() {
    try {
      const res = await wx.showModal({
        title: '确认删除',
        content: '将删除所有重复的词库，保留最新创建的版本，确定继续吗？',
        confirmText: '删除',
        confirmColor: '#ff4d4f'
      })

      if (res.confirm) {
        wx.showLoading({ title: '处理中...' })
        const result = await wx.cloud.callFunction({
          name: 'deleteDuplicateWordLists'
        })

        console.log('删除重复词库结果:', result)

        if (result.result && result.result.success) {
          wx.showToast({
            title: result.result.message,
            icon: 'success'
          })
          this.loadWordLists()
        } else {
          throw new Error(result.result?.error || '删除失败')
        }
      }
    } catch (error) {
      console.error('删除重复词库失败:', error)
      wx.showToast({
        title: error.message || '删除失败，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 跳转到导入页面
  goToImport(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/create/create?type=${type}`,
      fail: (error) => {
        console.error('跳转失败:', error)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
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

  // 跳转到创建词库页面
  goToCreate: function() {
    wx.navigateTo({
      url: `/pages/create/create?category=${this.data.currentCategory}`
    })
  },

  // 跳转到词库详情页
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/wordlist-detail/wordlist-detail?id=${id}`
    })
  }
}) 
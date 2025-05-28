// pages/list/list.js
Page({
    data: {
        wordLists: [],
        mainCategory: '全部',
        subCategory: '全部',
        mainCategories: ['全部', '语文', '英语', '其它'],
        subCategories: {
            '全部': ['全部'],
            '语文': ['全部', '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级'],
            '英语': ['全部', '小托福', '托福', '小学英语', '初中英语', '高中英语'],
            '其它': ['全部', '自定义']
        },
        searchKeyword: '',
        loading: false,
        hasMore: true,
        pageSize: 10,
        currentPage: 0
    },

    onLoad() {
        this.loadWordLists()
    },

    onPullDownRefresh() {
        this.setData({
            wordLists: [],
            currentPage: 0,
            hasMore: true
        }, () => {
            this.loadWordLists(() => {
                wx.stopPullDownRefresh()
            })
        })
    },

    onReachBottom() {
        if (this.data.hasMore && !this.data.loading) {
            this.loadWordLists()
        }
    },

    // 加载词库列表
    loadWordLists(callback) {
        if (this.data.loading) return

        this.setData({ loading: true })

        wx.cloud.callFunction({
            name: 'getWordLists',
            data: {
                mainCategory: this.data.mainCategory === '全部' ? '' : this.data.mainCategory,
                subCategory: this.data.subCategory === '全部' ? '' : this.data.subCategory,
                keyword: this.data.searchKeyword,
                page: this.data.currentPage,
                pageSize: this.data.pageSize
            },
            success: res => {
                if (res.result.success) {
                    const newLists = res.result.data
                    this.setData({
                        wordLists: [...this.data.wordLists, ...newLists],
                        currentPage: this.data.currentPage + 1,
                        hasMore: newLists.length === this.data.pageSize
                    })
                } else {
                    wx.showToast({
                        title: res.result.error || '加载失败',
                        icon: 'none'
                    })
                }
            },
            fail: err => {
                console.error('加载词库失败', err)
                wx.showToast({
                    title: '加载失败',
                    icon: 'none'
                })
            },
            complete: () => {
                this.setData({ loading: false })
                callback && callback()
            }
        })
    },

    // 选择主分类
    onMainCategoryChange(e) {
        const mainCategory = this.data.mainCategories[e.detail.value]
        this.setData({
            mainCategory,
            subCategory: '全部',
            wordLists: [],
            currentPage: 0,
            hasMore: true
        }, () => {
            this.loadWordLists()
        })
    },

    // 选择子分类
    onSubCategoryChange(e) {
        this.setData({
            subCategory: this.data.subCategories[this.data.mainCategory][e.detail.value],
            wordLists: [],
            currentPage: 0,
            hasMore: true
        }, () => {
            this.loadWordLists()
        })
    },

    // 搜索词库
    onSearch(e) {
        this.setData({
            searchKeyword: e.detail.value,
            wordLists: [],
            currentPage: 0,
            hasMore: true
        }, () => {
            this.loadWordLists()
        })
    },

    // 跳转到创建页面
    goToCreate() {
        wx.navigateTo({
            url: '/pages/create/create'
        })
    },

    // 跳转到词库详情
    goToDetail(e) {
        const { id } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/detail/detail?id=${id}`
        })
    },

    // 删除词库
    deleteWordList(e) {
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
                                // 从列表中移除
                                const wordLists = this.data.wordLists.filter(list => list._id !== id)
                                this.setData({ wordLists })
                            } else {
                                wx.showToast({
                                    title: res.result.error || '删除失败',
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
    }
}) 
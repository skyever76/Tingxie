// pages/create/create.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        name: '',
        description: '',
        words: '',
        mainCategory: '语文',
        subCategory: '小学一年级',
        mainCategories: ['语文', '英语', '其它'],
        subCategories: {
            '语文': ['小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级'],
            '英语': ['小托福', '托福', '小学英语', '初中英语', '高中英语'],
            '其它': ['自定义']
        },
        loading: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 初始化子分类
        this.setData({
            subCategory: this.data.subCategories[this.data.mainCategory][0]
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 输入词库名称
    onNameInput(e) {
        this.setData({
            name: e.detail.value
        })
    },

    // 输入词库描述
    onDescInput(e) {
        this.setData({
            description: e.detail.value
        })
    },

    // 输入单词列表
    onWordsInput(e) {
        this.setData({
            words: e.detail.value
        })
    },

    // 选择主分类
    onMainCategoryChange(e) {
        const mainCategory = this.data.mainCategories[e.detail.value]
        this.setData({
            mainCategory,
            subCategory: this.data.subCategories[mainCategory][0]
        })
    },

    // 选择子分类
    onSubCategoryChange(e) {
        this.setData({
            subCategory: this.data.subCategories[this.data.mainCategory][e.detail.value]
        })
    },

    // 创建词库
    createWordList() {
        const { name, description, words, mainCategory, subCategory } = this.data

        // 验证输入
        if (!name.trim()) {
            wx.showToast({
                title: '请输入词库名称',
                icon: 'none'
            })
            return
        }

        if (!words.trim()) {
            wx.showToast({
                title: '请输入词语列表',
                icon: 'none'
            })
            return
        }

        // 解析词语列表
        const wordList = this.parseWords(words)
        if (wordList.length === 0) {
            wx.showToast({
                title: '词语格式不正确',
                icon: 'none'
            })
            return
        }

        this.setData({ loading: true })

        // 调用云函数创建词库
        wx.cloud.callFunction({
            name: 'addWordList',
            data: {
                name,
                description,
                words: wordList,
                mainCategory,
                subCategory
            },
            success: res => {
                if (res.result.success) {
                    wx.showToast({
                        title: '创建成功',
                        icon: 'success'
                    })
                    // 返回词库列表页
                    setTimeout(() => {
                        wx.navigateBack()
                    }, 1500)
                } else {
                    wx.showToast({
                        title: res.result.error || '创建失败',
                        icon: 'none'
                    })
                }
            },
            fail: err => {
                console.error('创建词库失败', err)
                wx.showToast({
                    title: '创建失败',
                    icon: 'none'
                })
            },
            complete: () => {
                this.setData({ loading: false })
            }
        })
    },

    // 解析词语列表
    parseWords(text) {
        const lines = text.split('\n').filter(line => line.trim())
        const words = []
        
        for (const line of lines) {
            // 支持多种分隔符：逗号、制表符、空格
            const parts = line.split(/[,\t\s]+/).filter(part => part.trim())
            if (parts.length >= 1) {
                const word = {
                    text: parts[0].trim(),
                    pinyin: parts[1] ? parts[1].trim() : ''
                }
                words.push(word)
            }
        }
        
        return words
    }
})
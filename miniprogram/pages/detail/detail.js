// pages/detail/detail.js
Page({
    data: {
        id: '',
        wordList: null,
        words: [],
        loading: true,
        searchKeyword: '',
        showPinyin: true,
        isEditing: false,
        editWords: ''
    },

    onLoad(options) {
        if (options.id) {
            this.setData({ id: options.id })
            this.loadWordList()
        }
    },

    // 加载词库详情
    loadWordList() {
        this.setData({ loading: true })

        wx.cloud.callFunction({
            name: 'getWordList',
            data: { id: this.data.id },
            success: res => {
                if (res.result.success) {
                    const wordList = res.result.data
                    this.setData({
                        wordList,
                        words: wordList.words,
                        editWords: this.formatWordsForEdit(wordList.words)
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
            }
        })
    },

    // 搜索词语
    onSearch(e) {
        const keyword = e.detail.value.toLowerCase()
        this.setData({
            searchKeyword: keyword,
            words: this.data.wordList.words.filter(word => 
                word.text.toLowerCase().includes(keyword) ||
                (word.pinyin && word.pinyin.toLowerCase().includes(keyword))
            )
        })
    },

    // 切换拼音显示
    togglePinyin() {
        this.setData({
            showPinyin: !this.data.showPinyin
        })
    },

    // 开始听写
    startDictation() {
        wx.navigateTo({
            url: `/pages/dictation/dictation?id=${this.data.id}`
        })
    },

    // 进入编辑模式
    enterEditMode() {
        this.setData({
            isEditing: true,
            editWords: this.formatWordsForEdit(this.data.words)
        })
    },

    // 退出编辑模式
    exitEditMode() {
        this.setData({
            isEditing: false
        })
    },

    // 编辑词语列表
    onWordsInput(e) {
        this.setData({
            editWords: e.detail.value
        })
    },

    // 保存编辑
    saveEdit() {
        const words = this.parseWords(this.data.editWords)
        if (words.length === 0) {
            wx.showToast({
                title: '词语格式不正确',
                icon: 'none'
            })
            return
        }

        wx.cloud.callFunction({
            name: 'updateWordList',
            data: {
                id: this.data.id,
                words: words
            },
            success: res => {
                if (res.result.success) {
                    wx.showToast({
                        title: '保存成功',
                        icon: 'success'
                    })
                    this.setData({
                        isEditing: false,
                        words: words,
                        'wordList.words': words,
                        'wordList.totalWords': words.length
                    })
                } else {
                    wx.showToast({
                        title: res.result.error || '保存失败',
                        icon: 'none'
                    })
                }
            },
            fail: err => {
                console.error('保存词库失败', err)
                wx.showToast({
                    title: '保存失败',
                    icon: 'none'
                })
            }
        })
    },

    // 将词语列表格式化为编辑文本
    formatWordsForEdit(words) {
        return words.map(word => 
            word.pinyin ? `${word.text} ${word.pinyin}` : word.text
        ).join('\n')
    },

    // 解析编辑文本为词语列表
    parseWords(text) {
        const lines = text.split('\n').filter(line => line.trim())
        const words = []
        
        for (const line of lines) {
            const parts = line.split(/[\s]+/).filter(part => part.trim())
            if (parts.length >= 1) {
                words.push({
                    text: parts[0].trim(),
                    pinyin: parts[1] ? parts[1].trim() : ''
                })
            }
        }
        
        return words
    },

    // 分享词库
    onShareAppMessage() {
        return {
            title: this.data.wordList.name,
            path: `/pages/detail/detail?id=${this.data.id}`
        }
    }
}) 
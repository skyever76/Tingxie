// pages/dictation/dictation.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '',
        wordList: null,
        words: [],
        currentIndex: 0,
        currentWord: null,
        showAnswer: false,
        isPlaying: false,
        playSpeed: 1,
        repeatCount: 1,
        currentRepeat: 0,
        autoNext: false,
        progress: 0,
        loading: true,
        settings: {
            playSpeed: 1,
            repeatTimes: 1,
            pauseTime: 3,
            autoNext: false,
            randomOrder: false,
            showPinyin: true
        },
        lessonId: '',
        listId: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.id) {
            this.setData({ id: options.id })
            this.loadWordList()
        }
        this.setData({
            lessonId: options.lessonId || '',
            listId: options.listId || ''
        })
        // 加载云端进度
        this.loadProgress()
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
        return {
            title: `${this.data.wordList.name} - 亚当听写`,
            path: `/pages/dictation/dictation?id=${this.data.id}`
        }
    },

    // 加载云端进度
    loadProgress() {
        wx.cloud.callFunction({
            name: 'getDictationProgress',
            data: { id: this.data.id },
            success: res => {
                if (res.result.success) {
                    const progress = res.result.data
                    this.setData({
                        currentIndex: progress.currentIndex || 0,
                        settings: progress.settings || this.data.settings
                    })
                }
            }
        })
    },

    // 保存云端进度
    saveProgress() {
        wx.cloud.callFunction({
            name: 'updateDictationProgress',
            data: {
                id: this.data.id,
                currentIndex: this.data.currentIndex,
                settings: this.data.settings
            }
        })
    },

    // 加载词库
    loadWordList() {
        this.setData({ loading: true })

        wx.cloud.callFunction({
            name: 'getWordList',
            data: { id: this.data.id },
            success: res => {
                if (res.result.success) {
                    const wordList = res.result.data
                    let words = wordList.words
                    
                    // 如果设置了随机顺序，打乱词语顺序
                    if (this.data.settings.randomOrder) {
                        words = this.shuffleArray([...words])
                    }

                    this.setData({
                        wordList,
                        words,
                        currentWord: words[this.data.currentIndex],
                        loading: false
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
            }
        })
    },

    // 播放当前词语
    playCurrentWord() {
        if (!this.data.currentWord) return

        this.setData({ 
            isPlaying: true,
            currentRepeat: 0
        })

        this.playWord()
    },

    // 播放词语
    playWord() {
        if (this.data.currentRepeat >= this.data.settings.repeatTimes) {
            this.setData({ isPlaying: false })
            if (this.data.settings.autoNext) {
                setTimeout(() => {
                    this.nextWord()
                }, this.data.settings.pauseTime * 1000)
            }
            return
        }

        // 使用微信同声传译插件播放
        const plugin = requirePlugin("WechatSI")
        const manager = plugin.getRecordRecognitionManager()

        wx.textToSpeech({
            lang: 'zh_CN',
            text: this.data.currentWord.text,
            speed: this.data.settings.playSpeed,
            success: () => {
                this.setData({
                    currentRepeat: this.data.currentRepeat + 1
                })
                // 继续播放直到达到重复次数
                setTimeout(() => {
                    this.playWord()
                }, 1000)
            },
            fail: (err) => {
                console.error('播放失败', err)
                wx.showToast({
                    title: '播放失败',
                    icon: 'none'
                })
                this.setData({ isPlaying: false })
            }
        })
    },

    // 显示/隐藏答案
    toggleAnswer() {
        this.setData({
            showAnswer: !this.data.showAnswer
        })
    },

    // 下一个词语
    nextWord() {
        if (this.data.currentIndex >= this.data.words.length - 1) {
            wx.showToast({
                title: '已经是最后一个词',
                icon: 'none'
            })
            return
        }
        this.setData({
            currentIndex: this.data.currentIndex + 1,
            currentWord: this.data.words[this.data.currentIndex + 1],
            showAnswer: false
        }, this.saveProgress)
    },

    // 上一个词语
    prevWord() {
        if (this.data.currentIndex <= 0) {
            wx.showToast({
                title: '已经是第一个词',
                icon: 'none'
            })
            return
        }
        this.setData({
            currentIndex: this.data.currentIndex - 1,
            currentWord: this.data.words[this.data.currentIndex - 1],
            showAnswer: false
        }, this.saveProgress)
    },

    // 修改播放速度
    changeSpeed(e) {
        this.setData({
            'settings.playSpeed': e.detail.value
        }, this.saveProgress)
    },

    // 修改重复次数
    changeRepeat(e) {
        this.setData({
            'settings.repeatTimes': e.detail.value
        }, this.saveProgress)
    },

    // 切换自动播放
    toggleAutoNext() {
        this.setData({
            'settings.autoNext': !this.data.settings.autoNext
        }, this.saveProgress)
    },

    // 切换随机顺序
    toggleRandomOrder() {
        this.setData({
            'settings.randomOrder': !this.data.settings.randomOrder
        }, this.saveProgress)
    },

    // 切换显示拼音
    togglePinyin() {
        this.setData({
            'settings.showPinyin': !this.data.settings.showPinyin
        }, this.saveProgress)
    },

    // 打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]
        }
        return array
    }
})
// pages/dictation/dictation.js
const app = getApp()
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
        loadingAudio: false,
        settings: {
            playSpeed: 1,
            repeatTimes: 1,
            pauseTime: 3,
            autoNext: false,
            randomOrder: false,
            showPinyin: true
        },
        lessonId: '',
        listId: '',
        userInput: '',
        isCorrect: null,
        timeSpent: 0,
        startTime: null,
        completedWords: 0,
        totalWords: 0,
        pinyinList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.id) {
            this.setData({ id: options.id })
            this.loadWordList(options.id)
        }
        this.setData({
            lessonId: options.lessonId || '',
            listId: options.listId || ''
        })
        // 加载云端进度
        this.loadProgress()
        // 加载设置
        this.loadSettings()
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
        // 页面卸载时更新进度
        if (this.data.startTime) {
            this.updateProgress()
        }
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

    // 加载词库并获取拼音
    loadWordList(wordListId) {
        this.setData({ loading: true })
        // 1. 获取词库
        wx.cloud.callFunction({
            name: 'getWordList',
            data: { id: wordListId },
            success: res => {
                if (res.result && res.result.success) {
                    const wordList = res.result.data
                    if (!wordList || !wordList.words) {
                        wx.showToast({ 
                            title: '词库数据格式错误', 
                            icon: 'none' 
                        })
                        this.setData({ loading: false })
                        return
                    }
                    
                    // 设置当前词语
                    const currentWord = wordList.words[0]
                    
                    this.setData({ 
                        wordList,
                        words: wordList.words,
                        totalWords: wordList.words.length,
                        currentWord,
                        currentIndex: 0
                    })
                    
                    // 2. 获取拼音
                    this.getPinyinForWords(wordList.words.map(w => w.text))
                } else {
                    wx.showToast({ 
                        title: res.result?.error || '获取词库失败', 
                        icon: 'none' 
                    })
                    this.setData({ loading: false })
                }
            },
            fail: err => {
                console.error('获取词库失败:', err)
                wx.showToast({ 
                    title: '获取词库失败', 
                    icon: 'none' 
                })
                this.setData({ loading: false })
            }
        })
    },

    // 调用云函数获取拼音
    getPinyinForWords(words) {
        if (!words.length) {
            this.setData({ pinyinList: [], loading: false })
            return
        }
        wx.cloud.callFunction({
            name: 'getPinyin',
            data: { words },
            success: res => {
                console.log('获取拼音结果:', res)
                if (res.result && res.result.success && Array.isArray(res.result.data)) {
                    // 将拼音数组与词语对应
                    const wordsWithPinyin = this.data.words.map((word, index) => ({
                        ...word,
                        pinyin: res.result.data[index] || ''
                    }))
                    
                    this.setData({
                        words: wordsWithPinyin,
                        loading: false
                    })
                } else {
                    console.error('获取拼音失败:', res.result?.error || '未知错误')
                    wx.showToast({ 
                        title: res.result?.error || '拼音获取失败', 
                        icon: 'none' 
                    })
                    this.setData({ loading: false })
                }
            },
            fail: err => {
                console.error('调用云函数失败:', err)
                wx.showToast({ 
                    title: '拼音获取失败', 
                    icon: 'none' 
                })
                this.setData({ loading: false })
            }
        })
    },

    // 播放当前词语
    playCurrentWord() {
        if (!this.data.currentWord) {
            console.error('当前词语不存在')
            return
        }

        console.log('开始播放词语:', this.data.currentWord)

        this.setData({ 
            isPlaying: true,
            currentRepeat: 0
        })

        this.playWord()
    },

    // 播放词语
    playWord() {
        if (!this.data.currentWord) {
            console.error('当前词语不存在')
            this.setData({ isPlaying: false })
            return
        }

        if (this.data.currentRepeat >= this.data.settings.repeatTimes) {
            this.setData({ isPlaying: false })
            if (this.data.settings.autoNext) {
                setTimeout(() => {
                    this.nextWord()
                }, this.data.settings.pauseTime * 1000)
            }
            return
        }

        console.log('播放词语:', this.data.currentWord.text)

        // 使用微信内置的语音合成接口
        wx.textToSpeech({
            lang: 'zh_CN',
            tts: true,
            content: this.data.currentWord.text,
            speed: this.data.settings.playSpeed,
            success: (res) => {
                console.log('语音合成成功', res)
                // 创建音频上下文
                const innerAudioContext = wx.createInnerAudioContext()
                innerAudioContext.src = res.filename
                
                // 监听可以播放
                innerAudioContext.onCanplay(() => {
                    console.log('音频可以播放')
                    innerAudioContext.play()
                })
                
                // 监听播放结束
                innerAudioContext.onEnded(() => {
                    console.log('播放结束')
                    // 释放音频资源
                    innerAudioContext.destroy()
                    
                    this.setData({
                        currentRepeat: this.data.currentRepeat + 1
                    })
                    
                    // 继续播放直到达到重复次数
                    setTimeout(() => {
                        this.playWord()
                    }, 1000)
                })
                
                // 监听播放错误
                innerAudioContext.onError((err) => {
                    console.error('播放失败', err)
                    // 释放音频资源
                    innerAudioContext.destroy()
                    
                    wx.showToast({
                        title: '播放失败',
                        icon: 'none'
                    })
                    this.setData({ isPlaying: false })
                })
            },
            fail: (err) => {
                console.error('语音合成失败', err)
                wx.showToast({
                    title: '语音合成失败',
                    icon: 'none'
                })
                this.setData({ isPlaying: false })
            }
        })
    },

    // 显示/隐藏答案
    onShowAnswer() {
        this.setData({ 
            showAnswer: !this.data.showAnswer 
        });
    },

    // 切换到下一个词时，自动隐藏答案
    goToNextWord() {
        if (this.data.currentIndex < this.data.words.length - 1) {
            this.setData({
                currentIndex: this.data.currentIndex + 1,
                showAnswer: false
            });
            // ...播放下一个词的音频等逻辑...
        }
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
    },

    playAudio(word) {
        const audioContext = wx.createInnerAudioContext();
        audioContext.src = this.getAudioSrc(word);

        this.setData({ loadingAudio: true });

        audioContext.onCanplay(() => {
            this.setData({ loadingAudio: false });
            audioContext.play();
        });

        audioContext.onPlay(() => {
            this.setData({ loadingAudio: false });
        });

        audioContext.onError((err) => {
            this.setData({ loadingAudio: false });
            console.error('音频播放失败', err);
            wx.showToast({
                title: '音频加载失败',
                icon: 'none'
            });
        });
    },

    // 加载设置
    loadSettings() {
        const settings = wx.getStorageSync('dictationSettings') || this.data.settings
        this.setData({ settings })
    },

    // 保存设置
    saveSettings(settings) {
        this.setData({ settings })
        wx.setStorageSync('dictationSettings', settings)
    },

    // 获取拼音
    getPinyin(word) {
        // 这里可以调用拼音转换API或使用本地拼音库
        // 暂时返回空字符串，后续可以接入拼音服务
        return ''
    },

    startDictation() {
        this.setData({
            startTime: Date.now(),
            isPlaying: true
        })
        this.playCurrentWord()
    },

    checkAnswer() {
        if (!this.data.userInput.trim()) {
            wx.showToast({
                title: '请输入答案',
                icon: 'none'
            })
            return
        }

        const isCorrect = this.data.userInput.trim() === this.data.currentWord.word
        const completedWords = this.data.completedWords + 1

        this.setData({
            isCorrect,
            showAnswer: true,
            completedWords
        })

        // 延迟后进入下一个单词
        setTimeout(() => {
            this.nextWord()
        }, this.data.settings.pauseTime * 1000)
    },

    completeDictation() {
        const timeSpent = Math.floor((Date.now() - this.data.startTime) / 1000)
        
        // 更新进度
        this.updateProgress(timeSpent)

        wx.showModal({
            title: '听写完成',
            content: `用时: ${timeSpent}秒\n完成: ${this.data.completedWords}/${this.data.totalWords}个单词`,
            showCancel: false,
            success: () => {
                wx.navigateBack()
            }
        })
    },

    updateProgress(timeSpent = 0) {
        wx.cloud.callFunction({
            name: 'updateDictationProgress',
            data: {
                wordListId: this.data.wordList._id,
                wordListName: this.data.wordList.name,
                totalWords: this.data.totalWords,
                completedWords: this.data.completedWords,
                timeSpent: timeSpent || Math.floor((Date.now() - this.data.startTime) / 1000)
            }
        }).catch(err => {
            console.error('更新进度失败:', err)
        })
    },

    onInput(e) {
        this.setData({
            userInput: e.detail.value
        })
    }
})
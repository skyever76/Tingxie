// 听写核心页面
const app = getApp()
Page({
  data: {
    wordList: null,
    currentWord: null,
    currentIndex: 0,
    isPlaying: false,
    showAnswer: false,
    userInput: '',
    isCorrect: null,
    progress: 0,
    timeSpent: 0,
    startTime: null,
    completedWords: 0,
    totalWords: 0
  },
  onLoad: function(options) {
    if (options.id) {
      this.loadWordList(options.id)
    }
  },
  loadWordList: function(id) {
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'getWordList',
      data: { id }
    }).then(res => {
      if (res.result && res.result.data) {
        const wordList = res.result.data
        this.setData({
          wordList,
          totalWords: wordList.words.length,
          currentWord: wordList.words[0]
        })
      }
    }).catch(err => {
      console.error('加载词表失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  startDictation: function() {
    this.setData({
      startTime: Date.now(),
      isPlaying: true
    })
    this.playCurrentWord()
  },
  playCurrentWord: function() {
    if (!this.data.currentWord) return

    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = this.data.currentWord.audioUrl
    innerAudioContext.play()
  },
  checkAnswer: function() {
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
    }, 2000)
  },
  nextWord: function() {
    const nextIndex = this.data.currentIndex + 1
    if (nextIndex < this.data.wordList.words.length) {
      this.setData({
        currentIndex: nextIndex,
        currentWord: this.data.wordList.words[nextIndex],
        userInput: '',
        isCorrect: null,
        showAnswer: false,
        progress: (nextIndex / this.data.wordList.words.length) * 100
      })
    } else {
      this.completeDictation()
    }
  },
  completeDictation: function() {
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
  updateProgress: function(timeSpent = 0) {
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
  onInput: function(e) {
    this.setData({
      userInput: e.detail.value
    })
  },
  onUnload: function() {
    // 页面卸载时更新进度
    if (this.data.startTime) {
      this.updateProgress()
    }
  }
}) 
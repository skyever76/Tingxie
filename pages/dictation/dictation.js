// 听写核心页面
const app = getApp()
Page({
  data: {
    words: [],
    currentIndex: 0,
    isFinished: false,
    showSkeleton: true,
    errorMsg: '',
    autoNext: false,
    switchMode: 'manual',
    autoInterval: 3,
    currentWord: {},
    textId: ''
  },
  onLoad(options) {
    this.setData({ textId: options.textId || '' })
    this.loadSettings()
    this.loadWords()
    this.startTime = Date.now()
    this.autoTimer = null
  },
  onUnload() {
    if (this.autoTimer) clearTimeout(this.autoTimer)
  },
  // 加载设置
  loadSettings() {
    try {
      const settings = wx.getStorageSync('dictationSettings')
      this.setData({
        autoNext: settings && settings.autoNext,
        switchMode: settings && settings.switchMode || 'manual',
        autoInterval: settings && settings.autoInterval || 3
      })
    } catch {}
  },
  // 加载词条
  async loadWords() {
    this.setData({ showSkeleton: true, errorMsg: '' })
    try {
      const db = wx.cloud.database()
      let res = await db.collection('chinese_texts').doc(this.data.textId).get()
      if (!res.data) {
        res = await db.collection('english_lists').doc(this.data.textId).get()
      }
      if (!res.data) throw new Error('未找到词条')
      const words = res.data.words || []
      this.setData({
        words,
        currentIndex: 0,
        isFinished: false,
        showSkeleton: false,
        currentWord: words[0] || {}
      })
      this.startAutoNext()
    } catch (error) {
      console.error('加载词条失败', error)
      this.setData({ errorMsg: '加载失败，请下拉重试', showSkeleton: false })
    }
  },
  // TTS播放
  handlePlay() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    const word = this.data.currentWord
    if (!word || !word.text) return
    wx.showLoading({ title: '播放中' })
    wx.cloud.callFunction({
      name: 'tts',
      data: { text: word.text },
      success: () => { wx.hideLoading() },
      fail: () => { wx.hideLoading(); wx.showToast({ title: '播放失败', icon: 'none' }) }
    })
  },
  // 下一个
  handleNext() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    this.nextWord()
  },
  // 自动/手动切换
  startAutoNext() {
    if (this.autoTimer) clearTimeout(this.autoTimer)
    if (this.data.switchMode === 'auto' && !this.data.isFinished) {
      this.autoTimer = setTimeout(() => {
        this.nextWord()
      }, this.data.autoInterval * 1000)
    }
  },
  // 下一题
  nextWord() {
    const { currentIndex, words } = this.data
    if (currentIndex < words.length - 1) {
      this.setData({
        currentIndex: currentIndex + 1,
        currentWord: words[currentIndex + 1]
      })
      this.startAutoNext()
    } else {
      this.setData({ isFinished: true })
      if (this.autoTimer) clearTimeout(this.autoTimer)
      this.saveHistory()
    }
  },
  // 再来一轮
  handleRestart() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    this.setData({
      currentIndex: 0,
      isFinished: false,
      currentWord: this.data.words[0] || {}
    })
    this.startTime = Date.now()
    this.startAutoNext()
  },
  // 写入学习记录
  async saveHistory() {
    try {
      const db = wx.cloud.database()
      await db.collection('learning_history').add({
        data: {
          textId: this.data.textId,
          words: this.data.words.length,
          duration: Math.floor((Date.now() - this.startTime) / 1000),
          date: new Date(),
          _openid: app.globalData.openid
        }
      })
    } catch (error) {
      console.error('保存学习记录失败', error)
    }
  },
  // 获取设置中的振动开关
  getVibrationSetting() {
    try {
      const settings = wx.getStorageSync('dictationSettings')
      return settings && settings.vibration !== undefined ? settings.vibration : true
    } catch {
      return true
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.loadWords()
    wx.stopPullDownRefresh()
  }
}) 
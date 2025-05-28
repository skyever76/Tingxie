// 听写设置页面
const app = getApp()

// 默认设置
const DEFAULT_SETTINGS = {
  // 基本设置
  randomPlay: false,
  showPinyin: true,
  autoNext: false,
  // 新增
  switchMode: 'manual', // manual 或 auto
  autoInterval: 3, // 自动切换间隔秒
  
  // 播放设置
  playSpeed: 1.0,
  repeatTimes: 2,
  intervalTime: 3,
  
  // 其他设置
  vibration: true,
  soundFeedback: true
}

Page({
  data: {
    settings: {}
  },

  onLoad() {
    this.loadSettings()
  },

  // 加载设置
  loadSettings() {
    try {
      const settings = wx.getStorageSync('dictationSettings')
      this.setData({
        settings: settings || DEFAULT_SETTINGS
      })
    } catch (error) {
      console.error('加载设置失败：', error)
      this.setData({
        settings: DEFAULT_SETTINGS
      })
    }
  },

  // 保存设置
  saveSettings(settings) {
    try {
      wx.setStorageSync('dictationSettings', settings)
      // 更新全局设置
      app.globalData.dictationSettings = settings
    } catch (error) {
      console.error('保存设置失败：', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  // 随机播放开关
  handleRandomPlayChange(e) {
    const settings = { ...this.data.settings, randomPlay: e.detail.value }
    this.setData({ settings })
    this.saveSettings(settings)
  },

  // 显示拼音开关
  handleShowPinyinChange(e) {
    const settings = { ...this.data.settings, showPinyin: e.detail.value }
    this.setData({ settings })
    this.saveSettings(settings)
  },

  // 自动下一个开关
  handleAutoNextChange(e) {
    const settings = { ...this.data.settings, autoNext: e.detail.value }
    this.setData({ settings })
    this.saveSettings(settings)
  },

  // 播放速度
  handlePlaySpeedChange(e) {
    const settings = { ...this.data.settings, playSpeed: e.detail.value }
    this.setData({ settings })
    this.saveSettings(settings)
  },

  // 重复次数
  handleRepeatTimesChange(e) {
    const settings = { ...this.data.settings, repeatTimes: e.detail.value }
    this.setData({ settings })
    this.saveSettings(settings)
  },

  // 间隔时间
  handleIntervalTimeChange(e) {
    const settings = { ...this.data.settings, intervalTime: e.detail.value }
    this.setData({ settings })
    this.saveSettings(settings)
  },

  // 振动反馈开关
  handleVibrationChange(e) {
    const settings = { ...this.data.settings, vibration: e.detail.value }
    this.setData({ settings })
    this.saveSettings(settings)
  },

  // 声音反馈开关
  handleSoundFeedbackChange(e) {
    const settings = { ...this.data.settings, soundFeedback: e.detail.value }
    this.setData({ settings })
    this.saveSettings(settings)
  },

  // 答题切换方式
  handleSwitchModeChange(e) {
    const settings = { ...this.data.settings, switchMode: e.detail.value }
    this.setData({ settings })
    this.saveSettings(settings)
  },

  // 自动切换间隔
  handleAutoIntervalChange(e) {
    const settings = { ...this.data.settings, autoInterval: e.detail.value }
    this.setData({ settings })
    this.saveSettings(settings)
  },

  // 重置设置
  handleResetSettings() {
    wx.showModal({
      title: '确认重置',
      content: '确定要恢复默认设置吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            settings: DEFAULT_SETTINGS
          })
          this.saveSettings(DEFAULT_SETTINGS)
          wx.showToast({
            title: '已恢复默认设置',
            icon: 'success'
          })
        }
      }
    })
  }
}) 
// 中文词库课文列表页面
const app = getApp()
Page({
  data: {
    textList: [],
    showSkeleton: true,
    errorMsg: '',
    categoryId: ''
  },
  onLoad(options) {
    this.setData({ categoryId: options.categoryId || '' })
    this.loadTexts()
  },
  // 加载课文列表
  async loadTexts() {
    this.setData({ showSkeleton: true, errorMsg: '' })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('chinese_texts')
        .where({ categoryId: this.data.categoryId })
        .orderBy('order', 'asc')
        .get()
      this.setData({ textList: res.data, showSkeleton: false })
    } catch (error) {
      console.error('加载课文失败', error)
      this.setData({ errorMsg: '加载失败，请下拉重试', showSkeleton: false })
    }
  },
  // 点击课文
  handleTextTap(e) {
    if (this.getVibrationSetting()) wx.vibrateShort()
    const id = e.currentTarget.dataset.id
    // TODO: 跳转到听写页面
    wx.navigateTo({ url: `/pages/dictation/dictation?textId=${id}` })
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
    this.loadTexts()
    wx.stopPullDownRefresh()
  }
}) 
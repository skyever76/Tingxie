// 英文词库单元列表页面
const app = getApp()
Page({
  data: {
    unitList: [],
    showSkeleton: true,
    errorMsg: '',
    categoryId: ''
  },
  onLoad(options) {
    this.setData({ categoryId: options.categoryId || '' })
    this.loadUnits()
  },
  // 加载单元列表
  async loadUnits() {
    this.setData({ showSkeleton: true, errorMsg: '' })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('english_lists')
        .where({ categoryId: this.data.categoryId })
        .orderBy('order', 'asc')
        .get()
      this.setData({ unitList: res.data, showSkeleton: false })
    } catch (error) {
      console.error('加载单元失败', error)
      this.setData({ errorMsg: '加载失败，请下拉重试', showSkeleton: false })
    }
  },
  // 点击单元
  handleUnitTap(e) {
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
    this.loadUnits()
    wx.stopPullDownRefresh()
  }
}) 
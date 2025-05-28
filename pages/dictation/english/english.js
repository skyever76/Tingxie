// 英文词库多级目录页面
const app = getApp()
Page({
  data: {
    categoryList: [],
    showSkeleton: true,
    errorMsg: ''
  },
  onLoad() {
    this.loadCategories()
  },
  // 加载一级目录
  async loadCategories() {
    this.setData({ showSkeleton: true, errorMsg: '' })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('english_categories').orderBy('order', 'asc').get()
      this.setData({ categoryList: res.data, showSkeleton: false })
    } catch (error) {
      console.error('加载目录失败', error)
      this.setData({ errorMsg: '加载失败，请下拉重试', showSkeleton: false })
    }
  },
  // 点击目录
  handleCategoryTap(e) {
    if (this.getVibrationSetting()) wx.vibrateShort()
    const id = e.currentTarget.dataset.id
    // TODO: 跳转到二级目录/单元列表页面
    wx.navigateTo({ url: `/pages/english_lists/english_lists?categoryId=${id}` })
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
    this.loadCategories()
    wx.stopPullDownRefresh()
  }
}) 
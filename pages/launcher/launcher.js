Page({
  data: { isAdmin: false },
  onLoad(options) {
    // 判断用户身份
    const user = wx.getStorageSync('userInfo')
    this.setData({ isAdmin: user && user.role === 'admin' })
    // 解析参数，支持扫码/链接直达
    if (options && options.module) this.jumpToModule(options.module)
  },
  goDictation() { wx.navigateTo({ url: '/pages/dictation/chinese/chinese' }) },
  goQuiz() { wx.navigateTo({ url: '/pages/quiz/quiz_home/quiz_home' }) },
  goOther() { wx.navigateTo({ url: '/pages/other/other_home/other_home' }) },
  goAdmin() { wx.navigateTo({ url: '/pages/admin/admin_home/admin_home' }) },
  jumpToModule(module) {
    if (module === 'dictation') this.goDictation()
    if (module === 'quiz') this.goQuiz()
    if (module === 'other') this.goOther()
    if (module === 'admin') this.goAdmin()
  }
}) 
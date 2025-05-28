Page({
  goToWordlistManager() {
    wx.navigateTo({ url: '/pages/settings/wordlistManager' });
  },
  goToDictationSettings() {
    wx.navigateTo({ url: '/pages/settings/dictationSettings' });
  }
}); 
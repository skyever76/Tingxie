// index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    message: "Index Page Loaded"
  },

  onLoad: function(options) {
    console.log('[index.js] onLoad called');
    // For tab pages, onShow is better for refreshing user data
  },

  onShow: function() {
    console.log('[index.js] onShow called');
    this.checkUserInfo();
  },

  checkUserInfo: function() {
    console.log('[index.js] checkUserInfo called');
    if (app.globalData.userInfo) {
      console.log("[index.js] Found userInfo in globalData:", app.globalData.userInfo);
      this.setData({
        userInfo: app.globalData.userInfo
      });
      console.log("[index.js] userInfo set in page data:", this.data.userInfo);
    } else {
      console.log("[index.js] No userInfo found in globalData. User might not be logged in or data not synced yet.");
      this.setData({
        userInfo: null
      });
    }
  },

  // 跳转到词库列表
  goToWordList: function() {
    wx.navigateTo({
      url: '/pages/wordlist/wordlist'
    })
  },

  // 跳转到创建词库
  goToCreate: function() {
    wx.navigateTo({
      url: '/pages/create/create'
    })
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
}) 
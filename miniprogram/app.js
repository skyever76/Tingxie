// app.js
App({
  globalData: {
    userInfo: null,
    openid: null
  },
  onLaunch: function () {
    this.globalData.userInfo = null;
    this.globalData.openid = null;
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-5g9mvzy25122e260', // 你的真实云开发环境ID
        traceUser: true,
      })
    }
  },

  // 获取用户openid
  getOpenid: function() {
    return new Promise((resolve, reject) => {
      if (this.globalData.openid) {
        resolve(this.globalData.openid)
      } else {
        wx.cloud.callFunction({
          name: 'login',
          success: res => {
            this.globalData.openid = res.result.openid
            resolve(res.result.openid)
          },
          fail: err => {
            console.error('获取openid失败', err)
            reject(err)
          }
        })
      }
    })
  }
}) 
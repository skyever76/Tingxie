// login.js
Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
  },

  onLoad() {
    const app = getApp();
    app.globalData.userInfo = null;
    app.globalData.openid = null;
    // 可选：检测 getUserProfile 支持
  },

  handleGetUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        try {
          console.log("原始用户信息:", res);

          if (res.userInfo) {
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            });
            console.log("Page data updated with userInfo.");

            const app = getApp();
            console.log("LOGIN.JS: About to set globalData.userInfo. Current app.globalData.userInfo:", app.globalData.userInfo);
            app.globalData.userInfo = res.userInfo;
            console.log("LOGIN.JS: SUCCESSFULLY SET app.globalData.userInfo to:", JSON.parse(JSON.stringify(app.globalData.userInfo)));

            // 获取用户OpenID
            wx.cloud.callFunction({
              name: 'login',
              success: cloudRes => {
                try {
                  console.log("Cloud function 'login' success:", cloudRes);
                  if (cloudRes.result && cloudRes.result.openid) {
                    app.globalData.openid = cloudRes.result.openid;
                    console.log("GlobalData.openid updated:", app.globalData.openid);

                    // 登录成功后返回首页
                    wx.reLaunch({
                      url: '/pages/launcher/launcher',
                      success: () => {
                        const appAfterSwitch = getApp();
                        console.log("LOGIN.JS (after reLaunch success): app.globalData.userInfo IS:", JSON.parse(JSON.stringify(appAfterSwitch.globalData.userInfo)));
                        console.log("Successfully reLaunched to /pages/launcher/launcher");
                      },
                      fail: (reLaunchErr) => {
                        console.error("Failed to reLaunch to /pages/launcher/launcher:", reLaunchErr);
                        wx.showToast({ title: '跳转首页失败', icon: 'none' });
                      }
                    });
                  } else {
                    console.error("Cloud function 'login' did not return openid in result.", cloudRes);
                    wx.showToast({ title: '获取OpenID异常', icon: 'none' });
                  }
                } catch (errorInCloudSuccess) {
                  console.error("！！！ ERROR INSIDE wx.cloud.callFunction SUCCESS CALLBACK ！！！");
                  console.error("Error Name:", errorInCloudSuccess.name);
                  console.error("Error Message:", errorInCloudSuccess.message);
                  console.error("Error Stack:", errorInCloudSuccess.stack);
                  wx.showToast({
                    title: '处理OpenID时出错',
                    icon: 'none'
                  });
                }
              },
              fail: cloudErr => {
                console.error("Cloud function 'login' call FAILED:", cloudErr);
                wx.showToast({
                  title: '登录服务调用失败',
                  icon: 'none'
                });
              }
            });

          } else {
            console.warn("res.userInfo 为空", res);
            wx.showToast({ title: '未能获取用户信息', icon: 'none' });
          }
        } catch (errorInGetUserProfileSuccess) {
          console.error("！！！ ERROR INSIDE getUserProfile SUCCESS CALLBACK (outer) ！！！");
          console.error("Error Name:", errorInGetUserProfileSuccess.name);
          console.error("Error Message:", errorInGetUserProfileSuccess.message);
          console.error("Error Stack:", errorInGetUserProfileSuccess.stack);
          wx.showToast({
            title: '处理用户信息出错',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error("wx.getUserProfile API call FAILED:", err);
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        });
      }
    });
  }
}) 
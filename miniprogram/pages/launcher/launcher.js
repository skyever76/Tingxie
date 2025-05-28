// pages/launcher/launcher.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    goDictation() {
        wx.navigateTo({
            url: '/pages/dictation/chinese/chinese'
        });
    },
    goQuiz() {
        wx.navigateTo({
            url: '/pages/quiz/quiz_home/quiz_home'
        });
    },
    goOther() {
        wx.navigateTo({
            url: '/pages/other/other_home/other_home'
        });
    },
    goAdmin() {
        wx.navigateTo({
            url: '/pages/admin/admin_home/admin_home'
        });
    }
})
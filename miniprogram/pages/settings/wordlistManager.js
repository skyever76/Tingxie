Page({
  data: {
    wordlists: [],
    loading: false
  },
  onLoad() {
    this.fetchWordlists();
  },
  fetchWordlists() {
    this.setData({ loading: true });
    wx.cloud.callFunction({
      name: 'getMyWordLists',
      success: res => {
        if (res.result.success) {
          this.setData({ wordlists: res.result.data })
        } else {
          wx.showToast({ title: '获取词库失败', icon: 'none' })
        }
      },
      fail: () => wx.showToast({ title: '云函数调用失败', icon: 'none' }),
      complete: () => this.setData({ loading: false })
    })
  },
  addWordlist() {
    wx.showModal({
      title: '新建词库',
      editable: true,
      placeholderText: '请输入词库名称',
      success: res => {
        if (res.confirm && res.content) {
          wx.cloud.callFunction({
            name: 'addWordList',
            data: { name: res.content },
            success: r => {
              if (r.result.success) {
                wx.showToast({ title: '创建成功', icon: 'success' })
                this.fetchWordlists()
              } else {
                wx.showToast({ title: r.result.error || '创建失败', icon: 'none' })
              }
            },
            fail: () => wx.showToast({ title: '云函数调用失败', icon: 'none' })
          })
        }
      }
    })
  },
  deleteWordlist(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除？',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'deleteWordList',
            data: { id },
            success: r => {
              if (r.result.success) {
                wx.showToast({ title: '删除成功', icon: 'success' })
                this.fetchWordlists()
              } else {
                wx.showToast({ title: r.result.error || '删除失败', icon: 'none' })
              }
            },
            fail: () => wx.showToast({ title: '云函数调用失败', icon: 'none' })
          })
        }
      }
    })
  },
  renameWordlist(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '重命名词库',
      editable: true,
      placeholderText: '请输入新名称',
      success: res => {
        if (res.confirm && res.content) {
          wx.cloud.callFunction({
            name: 'updateWordList',
            data: { id, name: res.content },
            success: r => {
              if (r.result.success) {
                wx.showToast({ title: '重命名成功', icon: 'success' })
                this.fetchWordlists()
              } else {
                wx.showToast({ title: r.result.error || '重命名失败', icon: 'none' })
              }
            },
            fail: () => wx.showToast({ title: '云函数调用失败', icon: 'none' })
          })
        }
      }
    })
  },
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/settings/wordlistDetail?id=${id}` });
  },
  importWordlist() {
    wx.showToast({ title: '导入功能敬请期待', icon: 'none' });
  },
  exportWordlist() {
    wx.showToast({ title: '导出功能敬请期待', icon: 'none' });
  }
}); 
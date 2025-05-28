Page({
  data: {
    categories: [],
    loading: true
  },
  onLoad() {
    this.loadCategories();
  },
  loadCategories() {
    this.setData({ loading: true });
    wx.cloud.callFunction({
      name: 'getCategories',
      data: { type: 'grade', parentId: null, lang: 'en' },
      success: res => {
        this.setData({
          categories: res.result.data || [],
          loading: false
        });
      },
      fail: err => {
        wx.showToast({ title: '加载目录失败', icon: 'none' });
        this.setData({ loading: false });
      }
    });
  },
  goToCategory(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/english/category?categoryId=${id}`
    });
  }
}); 
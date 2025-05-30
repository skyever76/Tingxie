Page({
  data: {
    categories: [
      { id: 'toefl_primary', name: '小托福' },
      { id: 'toefl', name: '托福' },
      { id: 'ssat', name: 'SSAT' },
      { id: 'other', name: '其它' }
    ],
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
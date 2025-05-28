Page({
  data: {
    categoryId: '',
    subcategories: [],
    lists: [],
    loading: true
  },
  onLoad(options) {
    const { categoryId } = options;
    this.setData({ categoryId });
    this.loadSubcategoriesAndLists(categoryId);
  },
  loadSubcategoriesAndLists(categoryId) {
    this.setData({ loading: true });
    // 先查下级目录
    wx.cloud.callFunction({
      name: 'getCategories',
      data: { parentId: categoryId, lang: 'en' },
      success: res => {
        const subcategories = res.result.data || [];
        this.setData({ subcategories });
        // 再查词表
        wx.cloud.callFunction({
          name: 'getTextsByCategory',
          data: { categoryId, lang: 'en' },
          success: res2 => {
            this.setData({
              lists: res2.result.data || [],
              loading: false
            });
          },
          fail: err2 => {
            wx.showToast({ title: '加载词表失败', icon: 'none' });
            this.setData({ loading: false });
          }
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
  },
  goToDictation(e) {
    const listId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dictation/dictation?listId=${listId}`
    });
  }
}); 
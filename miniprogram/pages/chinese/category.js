Page({
  data: {
    categoryId: '',
    subcategories: [],
    lessons: [],
    loading: true
  },
  onLoad(options) {
    const { categoryId } = options;
    this.setData({ categoryId });
    this.loadSubcategoriesAndLessons(categoryId);
  },
  loadSubcategoriesAndLessons(categoryId) {
    this.setData({ loading: true });
    // 先查下级目录
    wx.cloud.callFunction({
      name: 'getCategories',
      data: { parentId: categoryId },
      success: res => {
        const subcategories = res.result.data || [];
        this.setData({ subcategories });
        // 再查课文
        wx.cloud.callFunction({
          name: 'getTextsByCategory',
          data: { categoryId },
          success: res2 => {
            this.setData({
              lessons: res2.result.data || [],
              loading: false
            });
          },
          fail: err2 => {
            wx.showToast({ title: '加载课文失败', icon: 'none' });
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
      url: `/pages/chinese/category?categoryId=${id}`
    });
  },
  goToDictation(e) {
    const lessonId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dictation/dictation?lessonId=${lessonId}`
    });
  }
}); 
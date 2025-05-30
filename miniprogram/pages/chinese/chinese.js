Page({
  data: {
    categories: [
      { id: 'grade1a', name: '一年级上' },
      { id: 'grade1b', name: '一年级下' },
      { id: 'grade2a', name: '二年级上' },
      { id: 'grade2b', name: '二年级下' },
      { id: 'grade3a', name: '三年级上' },
      { id: 'grade3b', name: '三年级下' },
      { id: 'grade4a', name: '四年级上' },
      { id: 'grade4b', name: '四年级下' },
      { id: 'grade5a', name: '五年级上' },
      { id: 'grade5b', name: '五年级下' }
    ]
  },
  goToCategory(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/chinese/category?categoryId=${id}`
    });
  }
}); 
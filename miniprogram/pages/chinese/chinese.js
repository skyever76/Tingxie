Page({
  data: {
    categories: [
      { id: 'grade1a', name: '小学语文一年级上' },
      { id: 'grade1b', name: '小学语文一年级下' },
      { id: 'grade2a', name: '小学语文二年级上' },
      { id: 'grade2b', name: '小学语文二年级下' },
      { id: 'grade3a', name: '小学语文三年级上' },
      { id: 'grade3b', name: '小学语文三年级下' },
      { id: 'grade4a', name: '小学语文四年级上' },
      { id: 'grade4b', name: '小学语文四年级下' },
      { id: 'grade5a', name: '小学语文五年级上' },
      { id: 'grade5b', name: '小学语文五年级下' }
    ]
  },
  goToCategory(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/chinese/category?categoryId=${id}`
    });
  }
}); 
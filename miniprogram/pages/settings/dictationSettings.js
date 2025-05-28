Page({
  data: {
    settings: {
      playSpeed: 1,
      repeatTimes: 1,
      autoNext: false,
      randomOrder: false,
      showPinyin: true
    }
  },
  changeSpeed(e) {
    this.setData({ 'settings.playSpeed': parseFloat(e.detail.value) });
  },
  changeRepeat(e) {
    this.setData({ 'settings.repeatTimes': parseInt(e.detail.value) });
  },
  toggleAutoNext() {
    this.setData({ 'settings.autoNext': !this.data.settings.autoNext });
  },
  toggleRandomOrder() {
    this.setData({ 'settings.randomOrder': !this.data.settings.randomOrder });
  },
  togglePinyin() {
    this.setData({ 'settings.showPinyin': !this.data.settings.showPinyin });
  }
}); 
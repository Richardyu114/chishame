const storage = require('../../utils/storage');

const POSTER_WIDTH = 750;
const POSTER_HEIGHT = 1334;

Page({
  data: {
    meal: null,
    generatingPoster: false
  },

  onLoad() {
    if (typeof wx !== 'undefined' && typeof wx.showShareMenu === 'function') {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }
  },

  onShow() {
    const meal = storage.getSelected();
    this.setData({ meal });
  },

  onShareAppMessage() {
    const meal = this.data.meal;
    if (!meal) {
      return {
        title: '吃啥么｜今天吃什么',
        path: '/pages/recommend/index'
      };
    }

    return {
      title: meal.shareText || `今天吃这个：${meal.title}`,
      path: '/pages/recommend/index'
    };
  },

  onShareTimeline() {
    const meal = this.data.meal;
    if (!meal) {
      return {
        title: '吃啥么｜今天吃什么',
        query: 'from=timeline'
      };
    }

    return {
      title: meal.shareText || `今天吃这个：${meal.title}`,
      query: 'from=timeline'
    };
  },

  pickAgain() {
    wx.navigateBack();
  },

  toRecommend() {
    wx.switchTab({ url: '/pages/recommend/index' });
  },

  copyShareText() {
    const meal = this.data.meal;
    if (!meal) return;
    wx.setClipboardData({
      data: meal.shareText,
      success: () => {
        wx.showToast({ title: '分享文案已复制', icon: 'success' });
      }
    });
  },

  openMomentsActions() {
    const meal = this.data.meal;
    if (!meal) return;

    wx.showActionSheet({
      itemList: ['生成分享图片', '直接分享到朋友圈'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.generatePoster();
          return;
        }
        this.shareToMomentsDirectly();
      }
    });
  },

  shareToMomentsDirectly() {
    if (typeof wx !== 'undefined' && typeof wx.showShareMenu === 'function') {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }

    wx.showModal({
      title: '分享到朋友圈',
      content: '请点击右上角“···”并选择“分享到朋友圈”。\n已为你准备好分享文案。',
      confirmText: '知道了',
      showCancel: false
    });
  },

  generatePoster() {
    if (this.data.generatingPoster) return;
    const meal = this.data.meal;
    if (!meal) return;

    this.setData({ generatingPoster: true });
    wx.showLoading({ title: '正在生成图片', mask: true });

    this.getImagePath(meal.image)
      .then((imagePath) => this.drawPoster(meal, imagePath))
      .then((tempPath) => this.savePosterToAlbum(tempPath))
      .catch((err) => {
        const message = err && err.message ? err.message : String(err || 'unknown error');
        wx.showToast({ title: message.includes('auth deny') ? '需要相册权限' : '生成失败，请重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ generatingPoster: false });
        wx.hideLoading();
      });
  },

  getImagePath(src) {
    return new Promise((resolve) => {
      if (!src || /^\//.test(src)) {
        resolve(src || '/assets/food/dish.jpg');
        return;
      }

      wx.getImageInfo({
        src,
        success: (res) => resolve(res.path || src),
        fail: () => resolve('/assets/food/dish.jpg')
      });
    });
  },

  drawPoster(meal, imagePath) {
    return new Promise((resolve, reject) => {
      const ctx = wx.createCanvasContext('sharePosterCanvas', this);

      // Background
      ctx.setFillStyle('#F7F6F2');
      ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

      // Cover area
      ctx.drawImage(imagePath, 0, 0, POSTER_WIDTH, 780);
      ctx.setFillStyle('rgba(15, 16, 15, 0.30)');
      ctx.fillRect(0, 520, POSTER_WIDTH, 260);

      // Brand + title
      ctx.setFillStyle('#FCFBF8');
      ctx.setFontSize(30);
      ctx.fillText('吃啥么 · 今日定案', 40, 600);

      ctx.setFillStyle('#FFFFFF');
      ctx.setFontSize(46);
      const title = meal.title || '今天吃这个';
      this.drawWrappedText(ctx, title, 40, 660, 670, 56, 2);

      // Info card
      ctx.setFillStyle('#FCFBF8');
      ctx.fillRect(30, 820, 690, 360);
      ctx.setStrokeStyle('#E6DFCE');
      ctx.strokeRect(30, 820, 690, 360);

      ctx.setFillStyle('#1F1F1F');
      ctx.setFontSize(30);
      ctx.fillText('这一餐结构', 60, 878);

      ctx.setFillStyle('#6B6B6B');
      ctx.setFontSize(26);
      const lines = [
        `主食：${meal.staple || '-'}`,
        `蛋白：${meal.protein || '-'}`,
        `蔬菜：${meal.veggie || '-'}`,
        `补充：${meal.extra || '-'}`,
        `估算热量：${meal.calories || '-'} kcal`
      ];

      lines.forEach((line, idx) => {
        ctx.fillText(line, 60, 930 + idx * 50);
      });

      // Quote
      ctx.setFillStyle('#2F5D50');
      ctx.setFontSize(26);
      this.drawWrappedText(ctx, `“${(meal.quote && meal.quote.text) || '民以食为天。'}”`, 40, 1230, 670, 40, 2);

      ctx.setFillStyle('#C6A969');
      ctx.setFontSize(22);
      ctx.fillText((meal.quote && meal.quote.from) || '《汉书》', 40, 1304);

      ctx.draw(false, () => {
        wx.canvasToTempFilePath(
          {
            canvasId: 'sharePosterCanvas',
            x: 0,
            y: 0,
            width: POSTER_WIDTH,
            height: POSTER_HEIGHT,
            destWidth: POSTER_WIDTH,
            destHeight: POSTER_HEIGHT,
            fileType: 'jpg',
            quality: 0.92,
            success: (res) => resolve(res.tempFilePath),
            fail: (err) => reject(err)
          },
          this
        );
      });
    });
  },

  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
    const chars = String(text || '').split('');
    let line = '';
    let drawY = y;
    let lineCount = 0;

    for (let i = 0; i < chars.length; i += 1) {
      const testLine = line + chars[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lineCount += 1;
        if (lineCount >= maxLines) {
          ctx.fillText(`${line.slice(0, Math.max(0, line.length - 1))}…`, x, drawY);
          return;
        }
        ctx.fillText(line, x, drawY);
        line = chars[i];
        drawY += lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line) {
      ctx.fillText(line, x, drawY);
    }
  },

  savePosterToAlbum(tempFilePath) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => {
          wx.showModal({
            title: '图片已保存',
            content: '已保存到相册，可直接去朋友圈发图。',
            confirmText: '去发朋友圈',
            cancelText: '稍后',
            success: () => resolve()
          });
        },
        fail: (err) => {
          if (err && String(err.errMsg || '').includes('auth deny')) {
            wx.showModal({
              title: '需要相册权限',
              content: '请在设置中开启“保存到相册”权限后重试。',
              confirmText: '去设置',
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting({ success: () => reject(err), fail: () => reject(err) });
                } else {
                  reject(err);
                }
              }
            });
            return;
          }
          reject(err);
        }
      });
    });
  }
});

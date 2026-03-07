const storage = require('../../utils/storage');

const POSTER_WIDTH = 750;
const POSTER_HEIGHT = 1334;
const posterThemes = ['极简', '国风', '夜色'];
const copyStyles = ['克制版', '搞笑版', '文艺版'];
const todaySigns = [
  '宜：认真吃饭，别瞎对付。',
  '宜：补充蛋白，下午更稳。',
  '宜：蔬菜到位，身体会感谢你。',
  '宜：少纠结，快做决定。',
  '宜：今天好好吃一顿。'
];

function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function getDateSeed(date = new Date()) {
  return Number(formatDate(date).replace(/\./g, ''));
}

function composeShareText(meal, style = '克制版') {
  if (!meal) return '吃啥么｜今天吃什么';
  const quote = (meal.quote && meal.quote.text) || '民以食为天。';

  if (style === '搞笑版') {
    return `今日胃口发布会：${meal.title}。\n配菜是${meal.veggie}，补充${meal.extra}。\n我宣布，今天不纠结了。`;
  }

  if (style === '文艺版') {
    return `今日餐案：${meal.title}，再配${meal.veggie}。\n${quote}\n—— 吃啥么`; 
  }

  return `今天吃这个：${meal.title}（${meal.protein} + ${meal.staple}），再配${meal.veggie}。`;
}

function getThemeTokens(theme = '极简') {
  if (theme === '国风') {
    return {
      bg: '#F6F1E8',
      overlay: 'rgba(62, 39, 17, 0.34)',
      panel: '#FFF8EB',
      panelBorder: '#E0D1B2',
      title: '#4A3424',
      body: '#6F5A45',
      accent: '#B88945',
      heroText: '#FFF9EE'
    };
  }

  if (theme === '夜色') {
    return {
      bg: '#111319',
      overlay: 'rgba(0, 0, 0, 0.46)',
      panel: '#1A1E28',
      panelBorder: '#2B3242',
      title: '#F1F4FA',
      body: '#AAB2C5',
      accent: '#8DA9FF',
      heroText: '#F4F7FF'
    };
  }

  return {
    bg: '#F7F6F2',
    overlay: 'rgba(15, 16, 15, 0.30)',
    panel: '#FCFBF8',
    panelBorder: '#E6DFCE',
    title: '#1F1F1F',
    body: '#6B6B6B',
    accent: '#C6A969',
    heroText: '#FFFFFF'
  };
}

Page({
  data: {
    meal: null,
    generatingPoster: false,
    posterTheme: '极简',
    copyStyle: '克制版'
  },

  onLoad() {
    this.ensureShareMenu();
  },

  onShow() {
    const meal = storage.getSelected();
    const profile = storage.getProfile();
    this.setData({
      meal,
      posterTheme: profile.posterTheme || '极简',
      copyStyle: profile.shareCopyStyle || '克制版'
    });
    this.ensureShareMenu();
  },

  ensureShareMenu() {
    if (typeof wx !== 'undefined' && typeof wx.showShareMenu === 'function') {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline'],
        fail: () => {}
      });
    }
  },

  persistSharePreferences(next = {}) {
    const profile = storage.getProfile();
    const merged = { ...profile, ...next };
    storage.setProfile(merged);
  },

  onShareAppMessage() {
    const meal = this.data.meal;
    return {
      title: composeShareText(meal, this.data.copyStyle),
      path: '/pages/recommend/index'
    };
  },

  onShareTimeline() {
    const meal = this.data.meal;
    return {
      title: composeShareText(meal, this.data.copyStyle),
      query: `from=timeline&style=${encodeURIComponent(this.data.copyStyle)}`
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
      data: composeShareText(meal, this.data.copyStyle),
      success: () => {
        wx.showToast({ title: '分享文案已复制', icon: 'success' });
      }
    });
  },

  openMomentsActions() {
    const meal = this.data.meal;
    if (!meal) return;

    wx.showActionSheet({
      itemList: ['生成分享图片（可选模板）', '直接分享到朋友圈（可选文案）'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.choosePosterThemeThenGenerate();
          return;
        }
        this.chooseCopyStyleThenShare();
      }
    });
  },

  choosePosterThemeThenGenerate() {
    wx.showActionSheet({
      itemList: posterThemes,
      success: (res) => {
        const nextTheme = posterThemes[res.tapIndex] || '极简';
        this.setData({ posterTheme: nextTheme });
        this.persistSharePreferences({ posterTheme: nextTheme });
        this.generatePoster();
      }
    });
  },

  chooseCopyStyleThenShare() {
    wx.showActionSheet({
      itemList: copyStyles,
      success: (res) => {
        const nextStyle = copyStyles[res.tapIndex] || '克制版';
        this.setData({ copyStyle: nextStyle });
        this.persistSharePreferences({ shareCopyStyle: nextStyle });
        this.shareToMomentsDirectly();
      }
    });
  },

  shareToMomentsDirectly() {
    const meal = this.data.meal;
    const shareText = composeShareText(meal, this.data.copyStyle);

    this.ensureShareMenu();

    wx.setClipboardData({
      data: shareText,
      success: () => {
        wx.showModal({
          title: '分享到朋友圈',
          content: `文案已复制（${this.data.copyStyle}）。\n请点击右上角“···”并选择“分享到朋友圈”。`,
          confirmText: '知道了',
          showCancel: false
        });
      },
      fail: () => {
        wx.showModal({
          title: '分享到朋友圈',
          content: '请点击右上角“···”并选择“分享到朋友圈”。',
          confirmText: '知道了',
          showCancel: false
        });
      }
    });
  },

  generatePoster() {
    if (this.data.generatingPoster) return;
    const meal = this.data.meal;
    if (!meal) return;

    this.setData({ generatingPoster: true });
    wx.showLoading({ title: '正在生成图片', mask: true });

    this.getImagePath(meal.image)
      .then((imagePath) => this.drawPoster(meal, imagePath, this.data.posterTheme))
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

  buildTodaySign(meal) {
    if (meal && meal.quote && meal.quote.text) {
      const clean = String(meal.quote.text).replace(/[。！!？?]$/, '');
      return `今日签：${clean}`;
    }
    const index = getDateSeed() % todaySigns.length;
    return `今日签：${todaySigns[index]}`;
  },

  drawPoster(meal, imagePath, theme = '极简') {
    return new Promise((resolve, reject) => {
      const tokens = getThemeTokens(theme);
      const ctx = wx.createCanvasContext('sharePosterCanvas', this);
      const dateText = formatDate(new Date());
      const signText = this.buildTodaySign(meal);

      // Background
      ctx.setFillStyle(tokens.bg);
      ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

      // Cover area
      ctx.drawImage(imagePath, 0, 0, POSTER_WIDTH, 780);
      ctx.setFillStyle(tokens.overlay);
      ctx.fillRect(0, 500, POSTER_WIDTH, 280);

      // Brand + title
      ctx.setFillStyle(tokens.heroText);
      ctx.setFontSize(30);
      ctx.fillText(`吃啥么 · ${theme}模板`, 40, 590);

      ctx.setFontSize(24);
      ctx.fillText(dateText, 40, 632);

      ctx.setFontSize(46);
      const title = meal.title || '今天吃这个';
      this.drawWrappedText(ctx, title, 40, 690, 670, 56, 2);

      // Info card
      ctx.setFillStyle(tokens.panel);
      ctx.fillRect(30, 820, 690, 390);
      ctx.setStrokeStyle(tokens.panelBorder);
      ctx.strokeRect(30, 820, 690, 390);

      ctx.setFillStyle(tokens.title);
      ctx.setFontSize(30);
      ctx.fillText('这一餐结构', 60, 878);

      ctx.setFillStyle(tokens.body);
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

      ctx.setFillStyle(tokens.accent);
      ctx.setFontSize(24);
      this.drawWrappedText(ctx, signText, 60, 1188, 630, 36, 2);

      // Quote
      ctx.setFillStyle(tokens.title);
      ctx.setFontSize(25);
      this.drawWrappedText(ctx, `“${(meal.quote && meal.quote.text) || '民以食为天。'}”`, 40, 1268, 670, 38, 2);

      ctx.setFillStyle(tokens.accent);
      ctx.setFontSize(22);
      ctx.fillText((meal.quote && meal.quote.from) || '《汉书》', 40, 1320);

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
            content: `已保存到相册（${this.data.posterTheme}模板），可直接去朋友圈发图。`,
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

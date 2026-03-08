const storage = require('../../utils/storage');

const POSTER_WIDTH = 750;
const POSTER_HEIGHT = 1334;
const POSTER_SCALE = 2;
const POSTER_CANVAS_WIDTH = POSTER_WIDTH * POSTER_SCALE;
const POSTER_CANVAS_HEIGHT = POSTER_HEIGHT * POSTER_SCALE;
const posterThemes = ['极简', '国风', '夜色'];
const copyStyles = ['雅正', '诙谐', '清言'];
const todaySigns = [
  '宜：珍重三餐，毋负春秋。',
  '宜：蛋白充足，神思更稳。',
  '宜：蔬食得当，气血自和。',
  '宜：少犹疑，先定其席。',
  '宜：从容进膳，安顿身心。'
];

const posterFallbackByTag = {
  清淡: '/assets/food/salad.jpg',
  均衡: '/assets/food/dish.jpg',
  下饭: '/assets/food/hotpot.jpg',
  浓香: '/assets/food/hotpot.jpg',
  辛辣: '/assets/food/spicy.jpg',
  面食: '/assets/food/noodle.jpg',
  轻食: '/assets/food/salad.jpg',
  鲜香: '/assets/food/sushi.jpg',
  日常: '/assets/food/dish.jpg'
};

function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function getDateSeed(date = new Date()) {
  return Number(formatDate(date).replace(/\./g, ''));
}

function pickByVariant(lines = [], variant = 0) {
  if (!Array.isArray(lines) || !lines.length) return '';
  const index = Math.abs(Number(variant || 0)) % lines.length;
  return lines[index];
}

function composeShareText(meal, style = '雅正', variant = 0) {
  if (!meal) return '吃啥么｜今日饮馔';
  const quote = (meal.quote && meal.quote.text) || '民以食为天。';

  if (style === '诙谐') {
    return pickByVariant([
      `今日议食既定：${meal.title}。\n佐以${meal.veggie}，并添${meal.extra}。\n此席可安，毋复犹疑。`,
      `本日餐案：${meal.title}。\n配${meal.veggie}，加${meal.extra}。\n今日诸事，可先从容进膳。`,
      `此刻定席：${meal.title}。\n佐菜${meal.veggie}，补充${meal.extra}。\n心意已决，且安心开餐。`
    ], variant);
  }

  if (style === '清言') {
    return pickByVariant([
      `今日餐案：${meal.title}，辅以${meal.veggie}。\n${quote}\n—— 吃啥么`,
      `今席所择：${meal.title}，并佐${meal.veggie}。\n${quote}\n—— 吃啥么`,
      `今日膳目：${meal.title}，配${meal.veggie}与${meal.extra}。\n${quote}\n—— 吃啥么`
    ], variant);
  }

  return pickByVariant([
    `今日本席：${meal.title}（${meal.protein} + ${meal.staple}），辅以${meal.veggie}。`,
    `今日定席：${meal.title}，主配为${meal.protein}与${meal.staple}，并佐${meal.veggie}。`,
    `今席已定：${meal.title}，结构为${meal.protein}、${meal.staple}，另配${meal.veggie}。`
  ], variant);
}

function getThemeTokens(theme = '极简') {
  if (theme === '国风') {
    return {
      bg: '#F5EEE2',
      overlay: 'rgba(58, 36, 14, 0.34)',
      panel: '#FFF7E8',
      panelBorder: '#DDCAA5',
      panelSoft: '#F6E7CD',
      title: '#4A3424',
      body: '#6A5541',
      accent: '#B88945',
      heroText: '#FFF9EE',
      ribbonBg: 'rgba(74, 52, 36, 0.44)',
      quotePanel: 'rgba(255, 248, 235, 0.9)'
    };
  }

  if (theme === '夜色') {
    return {
      bg: '#10131B',
      overlay: 'rgba(6, 10, 18, 0.54)',
      panel: '#1A1F2C',
      panelBorder: '#2C3650',
      panelSoft: '#222C40',
      title: '#F1F4FA',
      body: '#B0BAD0',
      accent: '#88A8FF',
      heroText: '#F4F7FF',
      ribbonBg: 'rgba(18, 24, 36, 0.56)',
      quotePanel: 'rgba(24, 30, 44, 0.88)'
    };
  }

  return {
    bg: '#F7F4EE',
    overlay: 'rgba(10, 12, 11, 0.32)',
    panel: '#FCF9F2',
    panelBorder: '#E2D8C4',
    panelSoft: '#F3EBDD',
    title: '#1F1F1F',
    body: '#666055',
    accent: '#C29A55',
    heroText: '#FFFFFF',
    ribbonBg: 'rgba(34, 38, 33, 0.36)',
    quotePanel: 'rgba(252, 250, 244, 0.9)'
  };
}

function drawRoundedRect(ctx, x, y, width, height, radius = 16) {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arc(x + width - r, y + r, r, -Math.PI / 2, 0);
  ctx.lineTo(x + width, y + height - r);
  ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2);
  ctx.lineTo(x + r, y + height);
  ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  ctx.closePath();
}

function pickPosterFallback(meal = {}) {
  const tags = Array.isArray(meal.tags) ? meal.tags : [];
  for (let i = 0; i < tags.length; i += 1) {
    const found = posterFallbackByTag[tags[i]];
    if (found) return found;
  }
  return '/assets/food/dish.jpg';
}

Page({
  data: {
    meal: null,
    generatingPoster: false,
    posterTheme: '极简',
    copyStyle: '雅正',
    copyVariantIndex: 0,
    shareCopyPreview: '',
    sharePanelVisible: false
  },

  onLoad() {
    this.ensureShareMenu();
  },

  onShow() {
    const meal = storage.getSelected();
    const profile = storage.getProfile();
    const copyStyle = profile.shareCopyStyle || '雅正';
    this.setData({
      meal,
      posterTheme: profile.posterTheme || '极简',
      copyStyle,
      copyVariantIndex: 0,
      shareCopyPreview: composeShareText(meal, copyStyle, 0),
      sharePanelVisible: false
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

  buildShareQuery(meal) {
    const query = [];
    if (meal && meal.id) query.push(`selected=${encodeURIComponent(String(meal.id))}`);
    if (meal && meal.title) query.push(`title=${encodeURIComponent(String(meal.title))}`);
    return query;
  },

  onShareAppMessage() {
    const meal = this.data.meal;
    const query = this.buildShareQuery(meal);
    return {
      title: composeShareText(meal, this.data.copyStyle, this.data.copyVariantIndex),
      path: query.length ? `/pages/recommend/index?${query.join('&')}` : '/pages/recommend/index'
    };
  },

  onShareTimeline() {
    const meal = this.data.meal;
    const query = this.buildShareQuery(meal);
    query.push(`from=timeline`, `style=${encodeURIComponent(this.data.copyStyle)}`);
    return {
      title: composeShareText(meal, this.data.copyStyle, this.data.copyVariantIndex),
      query: query.join('&')
    };
  },

  refreshShareCopyPreview(extra = {}) {
    const meal = extra.meal || this.data.meal;
    const style = extra.style || this.data.copyStyle;
    const variant = extra.variant !== undefined ? extra.variant : this.data.copyVariantIndex;

    this.setData({
      shareCopyPreview: composeShareText(meal, style, variant)
    });
  },

  openSharePanel() {
    if (!this.data.meal) {
      wx.showToast({ title: '请先定下一席餐案', icon: 'none' });
      return;
    }
    this.ensureShareMenu();
    this.refreshShareCopyPreview();
    this.setData({ sharePanelVisible: true });
  },

  closeSharePanel() {
    if (!this.data.sharePanelVisible) return;
    this.setData({ sharePanelVisible: false });
  },

  onTapShareMiniProgram() {
    this.closeSharePanel();
  },

  chooseCopyStyle() {
    wx.showActionSheet({
      itemList: copyStyles,
      success: (res) => {
        const nextStyle = copyStyles[res.tapIndex] || '雅正';
        this.setData({
          copyStyle: nextStyle,
          copyVariantIndex: 0
        }, () => {
          this.persistSharePreferences({ shareCopyStyle: nextStyle });
          this.refreshShareCopyPreview({ style: nextStyle, variant: 0 });
        });
      }
    });
  },

  rotateShareCopy() {
    const nextVariant = (Number(this.data.copyVariantIndex || 0) + 1) % 3;
    this.setData({ copyVariantIndex: nextVariant }, () => {
      this.refreshShareCopyPreview({ variant: nextVariant });
    });
  },

  pickAgain() {
    this.closeSharePanel();
    wx.navigateBack();
  },

  toRecommend() {
    this.closeSharePanel();
    wx.switchTab({ url: '/pages/recommend/index' });
  },

  copyShareText() {
    const meal = this.data.meal;
    if (!meal) return;
    wx.setClipboardData({
      data: this.data.shareCopyPreview || composeShareText(meal, this.data.copyStyle, this.data.copyVariantIndex),
      success: () => {
        wx.showToast({ title: '文案已复制', icon: 'success' });
      }
    });
  },

  openMomentsActions() {
    const meal = this.data.meal;
    if (!meal) return;

    wx.showActionSheet({
      itemList: ['生成雅集海报（可选风格）', '发布朋友圈文案（可选体裁）'],
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
    this.closeSharePanel();
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
    this.closeSharePanel();
    wx.showActionSheet({
      itemList: copyStyles,
      success: (res) => {
        const nextStyle = copyStyles[res.tapIndex] || '雅正';
        this.setData({
          copyStyle: nextStyle,
          copyVariantIndex: 0
        }, () => {
          this.persistSharePreferences({ shareCopyStyle: nextStyle });
          this.refreshShareCopyPreview({ style: nextStyle, variant: 0 });
          this.shareToMomentsDirectly();
        });
      }
    });
  },

  shareToMomentsDirectly() {
    const meal = this.data.meal;
    const shareText = composeShareText(meal, this.data.copyStyle, this.data.copyVariantIndex);

    this.ensureShareMenu();

    wx.setClipboardData({
      data: shareText,
      success: () => {
        wx.showModal({
          title: '发布朋友圈',
          content: `文案已备妥（${this.data.copyStyle}）。\n请点右上角“···”并选择“分享到朋友圈”。`,
          confirmText: '明白',
          showCancel: false
        });
      },
      fail: () => {
        wx.showModal({
          title: '发布朋友圈',
          content: '请点右上角“···”并选择“分享到朋友圈”。',
          confirmText: '明白',
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
    wx.showLoading({ title: '海报绘制中', mask: true });

    this.getImageAsset(meal.image, meal)
      .then((imageAsset) => this.drawPoster(meal, imageAsset, this.data.posterTheme))
      .then((tempPath) => this.savePosterToAlbum(tempPath))
      .catch((err) => {
        const message = err && err.message ? err.message : String(err || 'unknown error');
        wx.showToast({ title: message.includes('auth deny') ? '需启用相册权限' : '海报生成未成，请重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ generatingPoster: false });
        wx.hideLoading();
      });
  },

  getImageAsset(src, meal = {}) {
    return new Promise((resolve) => {
      const fallback = pickPosterFallback(meal);
      const target = src || fallback;

      wx.getImageInfo({
        src: target,
        success: (res) => {
          const width = Number(res.width || 0);
          const height = Number(res.height || 0);
          const lowResRemote = /^https?:\/\//.test(target) && (width < 900 || height < 900);

          if (!lowResRemote) {
            resolve({
              path: res.path || target,
              width,
              height
            });
            return;
          }

          wx.getImageInfo({
            src: fallback,
            success: (fallbackRes) => resolve({
              path: fallbackRes.path || fallback,
              width: Number(fallbackRes.width || 0),
              height: Number(fallbackRes.height || 0)
            }),
            fail: () => resolve({
              path: res.path || target,
              width,
              height
            })
          });
        },
        fail: () => resolve({
          path: fallback,
          width: 0,
          height: 0
        })
      });
    });
  },

  drawCoverImage(ctx, imageAsset, x, y, width, height) {
    const path = (imageAsset && imageAsset.path) || '/assets/food/dish.jpg';
    const imageWidth = Number((imageAsset && imageAsset.width) || 0);
    const imageHeight = Number((imageAsset && imageAsset.height) || 0);

    if (!imageWidth || !imageHeight) {
      ctx.drawImage(path, x, y, width, height);
      return;
    }

    const boxRatio = width / height;
    const imageRatio = imageWidth / imageHeight;

    let sx = 0;
    let sy = 0;
    let sw = imageWidth;
    let sh = imageHeight;

    if (imageRatio > boxRatio) {
      sw = imageHeight * boxRatio;
      sx = (imageWidth - sw) / 2;
    } else if (imageRatio < boxRatio) {
      sh = imageWidth / boxRatio;
      sy = (imageHeight - sh) / 2;
    }

    ctx.drawImage(path, sx, sy, sw, sh, x, y, width, height);
  },

  buildTodaySign(meal) {
    if (meal && meal.quote && meal.quote.text) {
      const clean = String(meal.quote.text).replace(/[。！!？?]$/, '');
      return `今日签：${clean}`;
    }
    const index = getDateSeed() % todaySigns.length;
    return `今日签：${todaySigns[index]}`;
  },

  drawPoster(meal, imageAsset, theme = '极简') {
    return new Promise((resolve, reject) => {
      const tokens = getThemeTokens(theme);
      const ctx = wx.createCanvasContext('sharePosterCanvas', this);
      const dateText = formatDate(new Date());
      const signText = this.buildTodaySign(meal);
      const coverX = 24;
      const coverY = 24;
      const coverWidth = POSTER_WIDTH - 48;
      const coverHeight = 760;

      // 以 2x 画布绘制，避免导出海报文字与线条发虚。
      ctx.scale(POSTER_SCALE, POSTER_SCALE);

      ctx.setFillStyle(tokens.bg);
      ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

      // 封面区：圆角裁切 + 底部渐暗，避免拉伸与边缘生硬。
      ctx.save();
      drawRoundedRect(ctx, coverX, coverY, coverWidth, coverHeight, 30);
      ctx.clip();
      this.drawCoverImage(ctx, imageAsset, coverX, coverY, coverWidth, coverHeight);
      ctx.setFillStyle(tokens.overlay);
      ctx.fillRect(coverX, 430, coverWidth, 354);
      ctx.restore();

      drawRoundedRect(ctx, coverX, coverY, coverWidth, 130, 30);
      ctx.setFillStyle(tokens.ribbonBg);
      ctx.fill();

      ctx.setStrokeStyle('rgba(255,255,255,0.22)');
      ctx.setLineWidth(1.2);
      drawRoundedRect(ctx, 18, 18, POSTER_WIDTH - 36, POSTER_HEIGHT - 36, 34);
      ctx.stroke();

      ctx.setFillStyle(tokens.heroText);
      ctx.setFontSize(30);
      ctx.fillText('吃啥么', 44, 78);
      ctx.setFontSize(20);
      ctx.fillText(dateText, 44, 112);

      drawRoundedRect(ctx, 618, 44, 92, 34, 17);
      ctx.setFillStyle('rgba(255,255,255,0.22)');
      ctx.fill();
      ctx.setFillStyle(tokens.heroText);
      ctx.setFontSize(20);
      ctx.fillText(theme, 646, 67);

      const title = meal.title || '今日餐案';
      const titleSize = title.length > 16 ? 44 : title.length > 12 ? 50 : 54;
      ctx.setFontSize(titleSize);
      this.drawWrappedText(ctx, title, 46, 620, 658, titleSize + 10, 2);

      ctx.setFontSize(23);
      ctx.setFillStyle('rgba(255, 255, 255, 0.92)');
      this.drawWrappedText(ctx, meal.dishLine || '', 46, 722, 658, 32, 1);

      drawRoundedRect(ctx, 30, 804, 690, 418, 24);
      ctx.setFillStyle(tokens.panel);
      ctx.fill();
      ctx.setLineWidth(2);
      ctx.setStrokeStyle(tokens.panelBorder);
      ctx.stroke();

      ctx.setFillStyle(tokens.panelSoft);
      drawRoundedRect(ctx, 30, 804, 690, 88, 24);
      ctx.fill();

      ctx.setFillStyle(tokens.accent);
      ctx.fillRect(58, 830, 6, 38);
      ctx.setFillStyle(tokens.title);
      ctx.setFontSize(31);
      ctx.fillText('本席结构', 76, 858);

      ctx.setFillStyle(tokens.body);
      ctx.setFontSize(26);
      const lines = [
        `主食：${meal.staple || '-'}`,
        `蛋白：${meal.protein || '-'}`,
        `蔬菜：${meal.veggie || '-'}`,
        `补充：${meal.extra || '-'}`,
        `热量：${meal.calories || '-'} kcal`
      ];

      lines.forEach((line, idx) => {
        ctx.fillText(line, 76, 928 + idx * 53);
      });

      ctx.setStrokeStyle(tokens.panelBorder);
      ctx.setLineWidth(1);
      ctx.beginPath();
      ctx.moveTo(56, 1178);
      ctx.lineTo(694, 1178);
      ctx.stroke();

      ctx.setFillStyle(tokens.accent);
      ctx.setFontSize(22);
      this.drawWrappedText(ctx, signText, 76, 1208, 618, 32, 1);

      drawRoundedRect(ctx, 30, 1232, 690, 90, 16);
      ctx.setFillStyle(tokens.quotePanel);
      ctx.fill();

      ctx.setFillStyle(tokens.title);
      ctx.setFontSize(21);
      this.drawWrappedText(ctx, `“${(meal.quote && meal.quote.text) || '民以食为天。'}”`, 44, 1258, 566, 26, 2);

      ctx.setFillStyle(tokens.accent);
      ctx.setFontSize(19);
      this.drawWrappedText(ctx, (meal.quote && meal.quote.from) || '《汉书》', 596, 1288, 112, 26, 1);

      ctx.draw(false, () => {
        wx.canvasToTempFilePath(
          {
            canvasId: 'sharePosterCanvas',
            x: 0,
            y: 0,
            width: POSTER_CANVAS_WIDTH,
            height: POSTER_CANVAS_HEIGHT,
            destWidth: POSTER_CANVAS_WIDTH,
            destHeight: POSTER_CANVAS_HEIGHT,
            fileType: 'png',
            quality: 1,
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
            title: '海报已存入相册',
            content: `已生成高清海报（${this.data.posterTheme}），可前往朋友圈发布。`,
            confirmText: '前往发布',
            cancelText: '稍后',
            success: () => resolve()
          });
        },
        fail: (err) => {
          if (err && String(err.errMsg || '').includes('auth deny')) {
            wx.showModal({
              title: '需启用相册权限',
              content: '请在设置中开启“保存到相册”权限后再试。',
              confirmText: '前往设置',
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

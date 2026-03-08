const storage = require('../../utils/storage');
const foodEngine = require('../../utils/foodEngine');
const personalize = require('../../utils/personalize');

function getTimeSlot() {
  const hour = new Date().getHours();
  if (hour < 11) return '早餐灵感';
  if (hour < 16) return '午餐灵感';
  if (hour < 22) return '晚餐灵感';
  return '夜宵灵感';
}

function safeDecode(value = '') {
  const raw = String(value || '');
  if (!raw) return '';
  try {
    return decodeURIComponent(raw);
  } catch (err) {
    return raw;
  }
}

const flavorCycle = ['随机', '清淡', '均衡', '下饭', '浓香', '辛辣', '轻食'];
const mealModeCycle = ['智能', '午餐', '晚餐'];

Page({
  data: {
    timeSlot: getTimeSlot(),
    cards: [],
    currentCardIndex: 0,
    loading: false,
    cardsVisible: true,
    pressedAction: '',
    successAction: '',
    busyAction: '',
    preferredFlavor: '随机',
    mealMode: '智能',
    activeMealMode: '午餐',
    flavorDriftHint: '口味画像还在形成中，先多翻几页看看。',
    selectedMealId: '',
    selectedMealTitle: ''
  },

  onLoad(options = {}) {
    this._loadToken = 0;
    this._successTimer = null;
    this._entryOptions = options || {};
  },

  onShow() {
    const profile = storage.getProfile();
    const logs = storage.getLogs();
    const activeMealMode = personalize.resolveMealMode(profile.mealMode || '智能');
    const drift = personalize.buildFlavorDrift(logs);
    const sharedSelected = this.consumeSharedSelected();
    const selected = sharedSelected || storage.getSelected();

    this.setData({
      preferredFlavor: profile.preferredFlavor || '随机',
      mealMode: profile.mealMode || '智能',
      activeMealMode,
      flavorDriftHint: drift.text,
      selectedMealId: (selected && selected.id) || '',
      selectedMealTitle: (selected && selected.title) || ''
    });
    this.ensureShareMenu();
    this.generateCards();
  },

  onHide() {
    this._loadToken += 1;
    if (this._successTimer) {
      clearTimeout(this._successTimer);
      this._successTimer = null;
    }
  },

  onUnload() {
    this._loadToken += 1;
    if (this._successTimer) {
      clearTimeout(this._successTimer);
      this._successTimer = null;
    }
  },

  onCardChange(e) {
    this.setData({ currentCardIndex: Number(e.detail.current || 0) });
  },

  onPressAction(e) {
    this.setData({ pressedAction: e.currentTarget.dataset.action || '' });
  },

  onReleaseAction() {
    this.setData({ pressedAction: '' });
  },

  ensureShareMenu() {
    if (typeof wx === 'undefined' || typeof wx.showShareMenu !== 'function') return;
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      fail: () => {}
    });
  },

  consumeSharedSelected() {
    const options = this._entryOptions || {};
    this._entryOptions = {};

    const selectedId = safeDecode(options.selected || '');
    const selectedTitle = safeDecode(options.title || '');
    if (!selectedId && !selectedTitle) return null;

    const existing = storage.getSelected();
    if (existing && selectedId && String(existing.id || '') === selectedId) {
      const merged = {
        ...existing,
        title: selectedTitle || existing.title || '',
        fromShare: true,
        ts: Date.now()
      };
      storage.setSelected(merged);
      return merged;
    }

    const fromCards = selectedId
      ? (this.data.cards || []).find((item) => String((item && item.id) || '') === selectedId)
      : null;

    const fallback = {
      id: selectedId || `shared_${Date.now()}`,
      title: selectedTitle || '朋友推荐',
      fromShare: true,
      ts: Date.now()
    };

    const next = fromCards ? { ...fromCards, fromShare: true, ts: Date.now() } : fallback;
    storage.setSelected(next);
    return next;
  },

  markActionSuccess(action) {
    if (this._successTimer) clearTimeout(this._successTimer);
    this.setData({ successAction: action || '' });
    this._successTimer = setTimeout(() => {
      this.setData({ successAction: '' });
    }, 380);
  },

  getCurrentCard() {
    const idx = this.data.currentCardIndex || 0;
    return this.data.cards[idx] || null;
  },

  getShareCandidate() {
    const selected = storage.getSelected();
    if (selected && (selected.id || selected.title)) return selected;
    return this.getCurrentCard() || null;
  },

  buildRecommendShareTitle(overrideTitle = '') {
    const selectedTitle = overrideTitle || this.data.selectedMealTitle;
    if (selectedTitle) {
      return `我今天选了：${selectedTitle}｜吃啥么`;
    }

    const current = this.getCurrentCard();
    if (current && current.title) {
      return `今天吃这个：${current.title}`;
    }

    return '吃啥么｜今天吃什么';
  },

  buildRecommendSharePayload() {
    const candidate = this.getShareCandidate();
    const selectedId = (candidate && candidate.id && String(candidate.id)) || '';
    const selectedTitle = (candidate && candidate.title && String(candidate.title)) || '';

    return {
      title: this.buildRecommendShareTitle(selectedTitle),
      selectedId,
      selectedTitle
    };
  },

  onShareAppMessage() {
    const payload = this.buildRecommendSharePayload();
    const query = [];
    if (payload.selectedId) query.push(`selected=${encodeURIComponent(payload.selectedId)}`);
    if (payload.selectedTitle) query.push(`title=${encodeURIComponent(payload.selectedTitle)}`);

    return {
      title: payload.title,
      path: query.length ? `/pages/recommend/index?${query.join('&')}` : '/pages/recommend/index'
    };
  },

  onShareTimeline() {
    const payload = this.buildRecommendSharePayload();
    const query = [];
    if (payload.selectedId) query.push(`selected=${encodeURIComponent(payload.selectedId)}`);
    if (payload.selectedTitle) query.push(`title=${encodeURIComponent(payload.selectedTitle)}`);

    return {
      title: payload.title,
      query: query.join('&')
    };
  },

  triggerLightHaptic() {
    if (typeof wx === 'undefined' || typeof wx.vibrateShort !== 'function') return;
    wx.vibrateShort({ type: 'light', fail: () => {} });
  },

  preloadCardImages(cards = []) {
    const urls = cards
      .map((item) => item && item.image)
      .filter(Boolean)
      .slice(0, 2)
      .filter((url) => /^https?:\/\//.test(url));

    urls.forEach((src) => {
      wx.getImageInfo({ src, success: () => {}, fail: () => {} });
    });
  },

  buildEngineProfileAndHint() {
    const profile = storage.getProfile();
    const logs = storage.getLogs();
    const activeMealMode = personalize.resolveMealMode(profile.mealMode || '智能');
    const drift = personalize.buildFlavorDrift(logs);

    return {
      profile: {
        ...profile,
        activeMealMode
      },
      logs,
      activeMealMode,
      flavorDriftHint: drift.text
    };
  },

  generateCards(triggerAction = '') {
    const startedAt = Date.now();
    const currentToken = startedAt;
    this._loadToken = currentToken;
    this.setData({ loading: true, busyAction: triggerAction });

    const { profile, logs, activeMealMode, flavorDriftHint } = this.buildEngineProfileAndHint();
    const history = storage.getContentHistory();

    foodEngine
      .generateMeals(profile, 4, logs, history)
      .then((cards) => {
        if (this._loadToken !== currentToken) return;

        const normalizedCards = Array.isArray(cards) ? cards : [];
        storage.rememberGeneratedCards(normalizedCards);
        this.preloadCardImages(normalizedCards);

        const minLoading = 180;
        const delay = Math.max(0, minLoading - (Date.now() - startedAt));

        setTimeout(() => {
          if (this._loadToken !== currentToken) return;
          this.setData({
            cards: normalizedCards,
            loading: false,
            busyAction: '',
            currentCardIndex: 0,
            cardsVisible: true,
            preferredFlavor: profile.preferredFlavor || '随机',
            mealMode: profile.mealMode || '智能',
            activeMealMode,
            flavorDriftHint
          });
        }, delay);
      })
      .catch(() => {
        if (this._loadToken !== currentToken) return;
        this.setData({
          cards: [],
          loading: false,
          busyAction: '',
          currentCardIndex: 0,
          cardsVisible: true,
          preferredFlavor: profile.preferredFlavor || '随机',
          mealMode: profile.mealMode || '智能',
          activeMealMode,
          flavorDriftHint
        });
      });
  },

  refreshCards() {
    this.triggerLightHaptic();
    this.setData({ pressedAction: '', cardsVisible: false });
    this.markActionSuccess('refresh');
    setTimeout(() => this.generateCards('refresh'), 140);
  },

  switchFlavor() {
    this.triggerLightHaptic();
    this.setData({ pressedAction: '' });
    const profile = storage.getProfile();
    const current = profile.preferredFlavor || '随机';
    const idx = flavorCycle.indexOf(current);
    const nextFlavor = flavorCycle[(idx + 1 + flavorCycle.length) % flavorCycle.length];
    profile.preferredFlavor = nextFlavor;
    storage.setProfile(profile);
    wx.showToast({ title: `口味：${nextFlavor}`, icon: 'none' });
    this.markActionSuccess('flavor');
    this.setData({ preferredFlavor: nextFlavor, cardsVisible: false });
    setTimeout(() => this.generateCards('flavor'), 140);
  },

  switchMealMode() {
    this.triggerLightHaptic();
    this.setData({ pressedAction: '' });
    const profile = storage.getProfile();
    const current = profile.mealMode || '智能';
    const idx = mealModeCycle.indexOf(current);
    const nextMode = mealModeCycle[(idx + 1 + mealModeCycle.length) % mealModeCycle.length];
    profile.mealMode = nextMode;
    storage.setProfile(profile);
    wx.showToast({ title: `餐别：${nextMode}`, icon: 'none' });
    this.markActionSuccess('mode');
    this.setData({ mealMode: nextMode, cardsVisible: false });
    setTimeout(() => this.generateCards('mode'), 140);
  },

  pickCurrent() {
    this.triggerLightHaptic();
    this.setData({ pressedAction: '' });
    const item = this.getCurrentCard();
    if (!item) return;
    this.markActionSuccess('choose');
    this.chooseWithItem(item, 'choose');
  },

  randomOne() {
    this.triggerLightHaptic();
    this.setData({ pressedAction: '' });
    const cards = this.data.cards;
    if (!cards.length) return;
    const randomIndex = Math.floor(Math.random() * cards.length);
    const item = cards[randomIndex];
    this.setData({ currentCardIndex: randomIndex });
    wx.showToast({ title: '今日有口福', icon: 'none' });
    this.markActionSuccess('random');
    this.chooseWithItem(item, 'random');
  },

  goShareResult() {
    this.triggerLightHaptic();
    this.setData({ pressedAction: '' });

    let selected = storage.getSelected();
    if (!selected && (this.data.selectedMealId || this.data.selectedMealTitle)) {
      selected = {
        id: this.data.selectedMealId || `shared_${Date.now()}`,
        title: this.data.selectedMealTitle || '朋友推荐',
        fromShare: true,
        ts: Date.now()
      };
      storage.setSelected(selected);
    }

    if (!selected) {
      wx.showToast({ title: '先选一个“今天吃这个”', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/result/index' });
  },

  chooseWithItem(item, action) {
    const profile = storage.getProfile();
    const weights = { ...(profile.tasteWeights || {}) };
    (item.tags || []).forEach((tag) => {
      weights[tag] = (weights[tag] || 0) + 1;
    });
    profile.tasteWeights = weights;
    storage.setProfile(profile);

    const log = {
      ts: Date.now(),
      action,
      mealId: item.id,
      mealTitle: item.title,
      protein: item.protein,
      mealMode: item.mealMode || this.data.activeMealMode,
      tags: item.tags
    };

    storage.setSelected({ ...item, ts: Date.now() });
    storage.appendLog(log);
    this.setData({
      selectedMealId: item.id || '',
      selectedMealTitle: item.title || ''
    });

    wx.showToast({
      title: '已选中，可分享图片或小程序',
      icon: 'success'
    });
  }
});

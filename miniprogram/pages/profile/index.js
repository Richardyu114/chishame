const storage = require('../../utils/storage');

Page({
  data: {
    profile: null,
    logs: [],
    tasteWeightEntries: []
  },

  hydrateView() {
    const profile = storage.getProfile();
    const logs = storage.getLogs().slice(0, 12);
    const tasteWeightEntries = Object.keys(profile.tasteWeights || {}).map(tag => ({
      tag,
      value: profile.tasteWeights[tag]
    }));
    this.setData({ profile, logs, tasteWeightEntries });
  },

  onShow() {
    this.hydrateView();
  },

  onRadiusChange(e) {
    const profile = this.data.profile;
    profile.radiusKm = Number(e.detail.value);
    storage.setProfile(profile);
    this.hydrateView();
  },

  onBudgetMinChange(e) {
    const profile = this.data.profile;
    profile.budgetMin = Number(e.detail.value);
    storage.setProfile(profile);
    this.hydrateView();
  },

  onBudgetMaxChange(e) {
    const profile = this.data.profile;
    profile.budgetMax = Number(e.detail.value);
    storage.setProfile(profile);
    this.hydrateView();
  },

  adjustWeight(e) {
    const tag = e.currentTarget.dataset.tag;
    const delta = Number(e.currentTarget.dataset.delta);
    const profile = this.data.profile;
    const next = (profile.tasteWeights[tag] || 0) + delta;
    profile.tasteWeights[tag] = next;
    storage.setProfile(profile);
    this.hydrateView();
  }
});

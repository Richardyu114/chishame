const tagPriority = ['辛辣', '浓香', '下饭', '鲜香', '面食', '轻食', '清淡', '均衡', '日常'];

const themePool = {
  清淡: [
    {
      name: '青岚',
      cardStyle: 'background: radial-gradient(circle at 22% 18%, rgba(225,241,236,0.9), rgba(225,241,236,0) 46%), linear-gradient(152deg, #2f5f62 0%, #4f7e7f 45%, #90b6a6 100%);',
      heroStyle: 'background: radial-gradient(circle at 28% 22%, rgba(236,248,242,0.82), rgba(236,248,242,0) 44%), linear-gradient(160deg, #355f67 0%, #4f7e7f 40%, #9dbfae 100%);',
      poster: {
        coverTop: '#2f5f62',
        coverMid: '#4f7e7f',
        coverBottom: '#9dbfae',
        glow: 'rgba(236,248,242,0.46)'
      }
    },
    {
      name: '汀雾',
      cardStyle: 'background: radial-gradient(circle at 78% 24%, rgba(224,240,241,0.82), rgba(224,240,241,0) 42%), linear-gradient(156deg, #31596f 0%, #4a758c 44%, #8fb0c5 100%);',
      heroStyle: 'background: radial-gradient(circle at 72% 22%, rgba(231,243,247,0.8), rgba(231,243,247,0) 44%), linear-gradient(160deg, #335e74 0%, #4b768f 45%, #9ab8c8 100%);',
      poster: {
        coverTop: '#31596f',
        coverMid: '#4a758c',
        coverBottom: '#9ab8c8',
        glow: 'rgba(231,243,247,0.44)'
      }
    }
  ],
  均衡: [
    {
      name: '素锦',
      cardStyle: 'background: radial-gradient(circle at 18% 18%, rgba(248,236,214,0.7), rgba(248,236,214,0) 44%), linear-gradient(154deg, #5b5a66 0%, #7f7b88 42%, #c7bca8 100%);',
      heroStyle: 'background: radial-gradient(circle at 20% 20%, rgba(248,238,218,0.72), rgba(248,238,218,0) 44%), linear-gradient(160deg, #5b5a66 0%, #7f7b88 44%, #c7bca8 100%);',
      poster: {
        coverTop: '#5b5a66',
        coverMid: '#7f7b88',
        coverBottom: '#c7bca8',
        glow: 'rgba(248,238,218,0.38)'
      }
    }
  ],
  下饭: [
    {
      name: '暖赭',
      cardStyle: 'background: radial-gradient(circle at 22% 20%, rgba(255,214,179,0.54), rgba(255,214,179,0) 44%), linear-gradient(152deg, #6b3f2e 0%, #9a5f3e 42%, #d39b5b 100%);',
      heroStyle: 'background: radial-gradient(circle at 25% 22%, rgba(255,219,188,0.56), rgba(255,219,188,0) 44%), linear-gradient(160deg, #6f4230 0%, #9d6141 44%, #d9a169 100%);',
      poster: {
        coverTop: '#6b3f2e',
        coverMid: '#9a5f3e',
        coverBottom: '#d9a169',
        glow: 'rgba(255,219,188,0.36)'
      }
    }
  ],
  浓香: [
    {
      name: '棕金',
      cardStyle: 'background: radial-gradient(circle at 78% 20%, rgba(255,220,171,0.5), rgba(255,220,171,0) 45%), linear-gradient(150deg, #4f3127 0%, #7d4f37 42%, #b58651 100%);',
      heroStyle: 'background: radial-gradient(circle at 74% 22%, rgba(255,225,180,0.52), rgba(255,225,180,0) 44%), linear-gradient(160deg, #523329 0%, #7f523b 45%, #bd8c57 100%);',
      poster: {
        coverTop: '#4f3127',
        coverMid: '#7d4f37',
        coverBottom: '#bd8c57',
        glow: 'rgba(255,225,180,0.34)'
      }
    }
  ],
  辛辣: [
    {
      name: '绯曜',
      cardStyle: 'background: radial-gradient(circle at 20% 18%, rgba(255,180,180,0.54), rgba(255,180,180,0) 42%), linear-gradient(150deg, #4a1f27 0%, #792b35 45%, #b5443f 100%);',
      heroStyle: 'background: radial-gradient(circle at 22% 20%, rgba(255,186,186,0.54), rgba(255,186,186,0) 44%), linear-gradient(160deg, #4d1f28 0%, #7d2f39 44%, #bd4b45 100%);',
      poster: {
        coverTop: '#4d1f28',
        coverMid: '#7d2f39',
        coverBottom: '#bd4b45',
        glow: 'rgba(255,186,186,0.34)'
      }
    }
  ],
  面食: [
    {
      name: '麦金',
      cardStyle: 'background: radial-gradient(circle at 26% 22%, rgba(253,230,187,0.58), rgba(253,230,187,0) 42%), linear-gradient(150deg, #5e4631 0%, #8a6645 44%, #c89c63 100%);',
      heroStyle: 'background: radial-gradient(circle at 24% 22%, rgba(253,232,194,0.58), rgba(253,232,194,0) 44%), linear-gradient(160deg, #604833 0%, #8f6a49 44%, #cda56e 100%);',
      poster: {
        coverTop: '#604833',
        coverMid: '#8f6a49',
        coverBottom: '#cda56e',
        glow: 'rgba(253,232,194,0.34)'
      }
    }
  ],
  轻食: [
    {
      name: '薄荷',
      cardStyle: 'background: radial-gradient(circle at 72% 18%, rgba(218,243,232,0.66), rgba(218,243,232,0) 42%), linear-gradient(150deg, #2f5e57 0%, #3f7d6d 45%, #89bda1 100%);',
      heroStyle: 'background: radial-gradient(circle at 70% 22%, rgba(223,246,236,0.66), rgba(223,246,236,0) 44%), linear-gradient(160deg, #315f58 0%, #41806f 44%, #8fc4a7 100%);',
      poster: {
        coverTop: '#315f58',
        coverMid: '#41806f',
        coverBottom: '#8fc4a7',
        glow: 'rgba(223,246,236,0.36)'
      }
    }
  ],
  鲜香: [
    {
      name: '海岚',
      cardStyle: 'background: radial-gradient(circle at 74% 16%, rgba(204,231,248,0.62), rgba(204,231,248,0) 42%), linear-gradient(150deg, #284b68 0%, #3f6f90 46%, #83aec9 100%);',
      heroStyle: 'background: radial-gradient(circle at 70% 20%, rgba(211,236,250,0.62), rgba(211,236,250,0) 44%), linear-gradient(160deg, #2a4f6e 0%, #437395 44%, #8ab3cd 100%);',
      poster: {
        coverTop: '#2a4f6e',
        coverMid: '#437395',
        coverBottom: '#8ab3cd',
        glow: 'rgba(211,236,250,0.34)'
      }
    }
  ],
  日常: [
    {
      name: '青岩',
      cardStyle: 'background: radial-gradient(circle at 20% 20%, rgba(227,233,224,0.56), rgba(227,233,224,0) 44%), linear-gradient(154deg, #3c4b4e 0%, #596b6f 43%, #8ca19f 100%);',
      heroStyle: 'background: radial-gradient(circle at 22% 20%, rgba(233,238,231,0.56), rgba(233,238,231,0) 44%), linear-gradient(160deg, #3f4f52 0%, #5e7175 44%, #95a9a7 100%);',
      poster: {
        coverTop: '#3f4f52',
        coverMid: '#5e7175',
        coverBottom: '#95a9a7',
        glow: 'rgba(233,238,231,0.32)'
      }
    }
  ]
};

function hashString(text = '') {
  let hash = 0;
  const source = String(text || '');
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) - hash) + source.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickPrimaryTag(tags = []) {
  const set = new Set(Array.isArray(tags) ? tags : []);
  for (let i = 0; i < tagPriority.length; i += 1) {
    const tag = tagPriority[i];
    if (set.has(tag)) return tag;
  }
  return '日常';
}

function resolveVisualTheme(tags = [], seedText = '') {
  const primaryTag = pickPrimaryTag(tags);
  const pool = themePool[primaryTag] || themePool['日常'];
  const index = hashString(`${seedText}|${primaryTag}`) % pool.length;
  return {
    ...pool[index],
    tag: primaryTag
  };
}

module.exports = {
  resolveVisualTheme
};

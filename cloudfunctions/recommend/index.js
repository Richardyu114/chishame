// 云函数占位：后续迁移打分逻辑到云端
exports.main = async (event) => {
  return {
    ok: true,
    message: 'recommend 占位函数，可接收 nearby places + profile 后返回3条推荐。',
    input: event || {}
  };
};

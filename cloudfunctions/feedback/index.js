// 云函数占位：接收“就吃这个/不想吃这类”等行为日志
exports.main = async (event) => {
  return {
    ok: true,
    message: 'feedback 占位函数，可将日志写入云数据库。',
    input: event || {}
  };
};

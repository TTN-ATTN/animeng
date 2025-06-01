// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)', // áp dụng cho tất cả các đường dẫn
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
    ];
  },
};
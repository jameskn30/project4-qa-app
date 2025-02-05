module.exports = {
  async rewrites() {
    // reverse proxy
    const chatApiEndpoint = process.env.CHATAPI_ENDPOINT;
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      // {
      //   source: '/chat/:path*',
      //   destination: `${chatApiEndpoint}/:path*`,
      // },
    ]
  },
}

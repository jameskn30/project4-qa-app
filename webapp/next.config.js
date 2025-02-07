module.exports = {
  async rewrites() {
    const chatApiEndpoint = process.env.CHATAPI_ENDPOINT;
    return [
      {
        source: '/chatapi/:path*',
        destination: `${chatApiEndpoint}/:path*`,
      },
    ];
  },
}

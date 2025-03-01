module.exports = {
  images: {
    domains: ['media0.giphy.com', 'media1.giphy.com', 'media2.giphy.com', 'media3.giphy.com','media4.giphy.com' ],
  },
  async rewrites() {
    const chatApiEndpoint = process.env.CHATAPI_ENDPOINT;
    const llmApiEndpoint = process.env.LLM_API_ENDPOINT;
    return [
      {
        source: '/chatapi/:path*',
        destination: `${chatApiEndpoint}/:path*`,
      },
      {
        source: '/llm/:path*',
        destination: `${llmApiEndpoint}/:path*`,
      },
    ];
  },
}

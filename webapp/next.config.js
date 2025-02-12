module.exports = {
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

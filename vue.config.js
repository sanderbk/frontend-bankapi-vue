module.exports = {
    transpileDependencies: ['vue'], // Adjust as needed based on your dependencies
    publicPath: process.env.NODE_ENV === 'production'
      ? '/rontend-bankapi-vue/'
      : '/'
  };
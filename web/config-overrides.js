const { override } = require('customize-cra');
const cspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const cspConfigPolicy = {
  'default-src': [
    "'self'",
    ' https://dev.oidc.gov.bc.ca/',
    'http://localhost:8100/api/',
    'https://registry-web-platform-registry-dev.apps.silver.devops.gov.bc.ca/api/',
  ],
  'base-uri': "'self'",
  'script-src': "'self'",
  'manifest-src': "'self'",
  'font-src': "'self'",
  'style-src': "'self'",
  'img-src': ["'self'", 'https://avatars.githubusercontent.com/'],
};

function addCspHtmlWebpackPlugin(config) {
  console.log('haihaihaiha', process.env);
  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(new cspHtmlWebpackPlugin(cspConfigPolicy));
  }

  return config;
}

module.exports = {
  webpack: override(addCspHtmlWebpackPlugin),
};

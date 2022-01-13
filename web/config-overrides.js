const { override } = require('customize-cra');
const cspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const cspConfigPolicy = {
  'default-src': [
    "'self'",
    ' https://dev.oidc.gov.bc.ca/',
    'http://localhost:8100/api/',
    'https://registry-web-platform-registry-dev.apps.silver.devops.gov.bc.ca/api/',
  ],
  'script-src': ["'self'"],
  'base-uri': "'self'",
  'manifest-src': "'self'",
  'font-src': "'self'",
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'https://avatars.githubusercontent.com/'],
};

const additionalOps = {
  enabled: true,
  hashingMethod: 'sha256',
  nonceEnabled: { 'script-src': false, 'style-src': false },
};
function addCspHtmlWebpackPlugin(config) {
  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(new cspHtmlWebpackPlugin(cspConfigPolicy, additionalOps));
  }

  return config;
}

module.exports = {
  webpack: override(addCspHtmlWebpackPlugin),
};

const { override } = require('customize-cra');
const cspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const cspConfigPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'base-uri': "'self'",
  'manifest-src': "'self'",
  'font-src': "'self'",
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'https://avatars.githubusercontent.com/'],
  'object-src': "'self'",
  'frame-src': [
    "'self'",
    'https://dev.oidc.gov.bc.ca/',
    'https://oidc.gov.bc.ca',
  ],
  'frame-ancestors': "'self'",
  'connect-src': [
    "'self'",
    'https://api.github.com/users/',
    'https://dev.oidc.gov.bc.ca/',
    'https://oidc.gov.bc.ca',
    '*.gov.bc.ca/api/',
  ],
  'form-action': ["'self'"],
};

const additionalOps = {
  enabled: true,
  hashingMethod: 'sha256',
  nonceEnabled: { 'script-src': true, 'style-src': false },
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

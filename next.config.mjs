/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Only run ESLint on specified directories
    dirs: ['app', 'pages', 'components', 'lib', 'src'],
    // Add custom ESLint configuration
    config: {
      rules: {
        'react/no-unescaped-entities': 'off',
      },
    },
  },
};

export default nextConfig;

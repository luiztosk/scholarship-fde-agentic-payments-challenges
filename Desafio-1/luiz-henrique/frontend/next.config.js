/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  transpilePackages: ['aws-amplify', '@aws-amplify/ui-react'],
};

export default nextConfig;

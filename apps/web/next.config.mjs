/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@imgx/core'],
  serverExternalPackages: ['sharp'],
};

export default withNextIntl(nextConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        serverActions: {
            allowedOrigins: ["analyze.yorunoken.com", "127.0.0.1:3006"],
        },
    },
    images: {
        remotePatterns: [{ hostname: "assets.ppy.sh" }],
    },
};

export default nextConfig;

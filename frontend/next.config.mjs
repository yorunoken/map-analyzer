/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost"],
        },
    },
    images: {
        remotePatterns: [{ hostname: "assets.ppy.sh" }],
    },
};

export default nextConfig;

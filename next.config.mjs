/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    if (isServer) {
      config.resolve.alias['@imgly/background-removal'] = false;
      config.resolve.alias['onnxruntime-web'] = false;
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        module: false,
      };
    }

    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.compilation.tap('SkipMinifiedPlugin', (compilation) => {
          compilation.hooks.processAssets.tap(
            {
              name: 'SkipMinifiedPlugin',
              stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE - 10,
            },
            (assets) => {
              for (const name of Object.keys(assets)) {
                if (name.includes('ort') || name.endsWith('.min.mjs') || name.endsWith('.min.js')) {
                  compilation.updateAsset(name, (source) => source, { minimized: true });
                }
              }
            }
          );
        });
      },
    });

    return config;
  },
};

export default nextConfig;


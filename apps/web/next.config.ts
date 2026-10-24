import type {NextConfig} from 'next';
const nextConfig:NextConfig={
  reactStrictMode:true,
  /** BFF proxy transparente: las pruebas del navegador hablan con su mismo origen. */
  async rewrites(){
    const api=(process.env.API_PROXY_TARGET||'http://localhost:4000').replace(/\/$/,'');
    return [{source:'/api/v1/:path*',destination:`${api}/api/v1/:path*`}];
  }
};
export default nextConfig;

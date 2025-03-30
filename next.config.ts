import type { NextConfig } from "next";
// import { headers } from "next/headers";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  // return [
  //   {
  //     headers: [
  //       {
  //         key: "X-Frame-Options",
  //         value: "SAMEORIGIN",
  //       },
          // {
          //   key: 'Content-Security-Policy',
          //   value: cspHeader.replace(/\n/g, ''),
          // },
  //     ]
  //   }
  // ]
};

export default nextConfig;

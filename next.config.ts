import { middleware } from "@/middleware";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true
})

module.exports = withPWA({
  typescript: {
    "ignoreBuildErrors": true
  },
})
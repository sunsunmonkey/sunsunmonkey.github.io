import { defineConfig } from "vitepress";
import { nav } from "./relaConf";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    assetsInclude: ["**/*.awebp"],
  },
  title: "Sunsunmonkey blog",
  description: "Sunsunmonkey blog",
  head: [
    ["link", { rel: "icon", href: "/imgs/avatars.png" }],
    ["meta", { name: "referrer", content: "no-referrer" }],
  ],
  themeConfig: {
    logo: "/imgs/avatars.png", // 表示docs/public/avartar.png
    // https://vitepress.dev/reference/default-theme-config
    nav: nav,

    sidebar: [
      {
        text: "前端",
        link: "/FE/",
        items: [
          {
            text: "react",
            items: [
              { text: "概述", link: "/FE/react/start.md" },
              { text: "jsx", link: "/FE/react/jsx.md" },
              { text: "mount", link: "/FE/react/mount.md" },
              { text: "事件系统", link: "/FE/react/event.md" },
              { text: "useState", link: "/FE/react/useState.md" },
              { text: "diff", link: "/FE/react/update_diff.md" },
              { text: "Scheduler", link: "/FE/react/Scheduler.md" },
              { text: "useEffect", link: "/FE/react/useEffect.md" },
              { text: "useRef", link: "/FE/react/useRef.md" },
              { text: "useContext", link: "/FE/react/useContext.md" },
              { text: "并发更新", link: "/FE/react/concurrent.md" },
              { text: "useTransition", link: "/FE/react/useTransition.md" },
              { text: "性能优化", link: "/FE/react/performance.md" },
              { text: "杂记", link: "/FE/react/free.md" },
              { text: "zustand", link: "/FE/react/zustand.md" },
              { text: "对effect一点理解", link: "/FE/react/react-effect" },
              {
                text: "官网性能优化",
                link: "/FE/react/officalwebsite-performance",
              },
            ],
          },
          {
            text: "typescript",
            items: [
              { text: "基础知识总结", link: "/FE/typescript/basic" },
              { text: "类型层次", link: "/FE/typescript/layer" },
              { text: "工具类型", link: "/FE/typescript/tool" },
            ],
          },
          {
            text: "vite",
            items: [
              { text: "dev阶段的vite", link: "/FE/vite/dev-stage" },
              {
                text: "vite的hmr",
                link: "/FE/vite/hmr",
              },
            ],
          },
          {
            text: "一些工具",
            items: [{ text: "tailwind插件", link: "/FE/tool/tailwind-plugin" }],
          },
        ],
      },
      {
        text: "算法",
        items: [{ text: "kmp算法", link: "/algorithm/kmp" }],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/sunsunmonkey" }],
  },
});

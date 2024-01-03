import { defineConfig } from "vitepress";
import { nav } from "./relaConf";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sunsunmonkey blog",
  description: "Sunsunmonkey blog",
  head: [["link", { rel: "icon", href: "/imgs/avatars.png" }]],
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
              { text: "对effect一点理解", link: "/FE/react/react-effect" },
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

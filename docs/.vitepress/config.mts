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
            text: "一些工具",
            items: [{ text: "tailwind插件", link: "/FE/tool/tailwind-plugin" }],
          },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/sunsunmonkey" }],
  },
});

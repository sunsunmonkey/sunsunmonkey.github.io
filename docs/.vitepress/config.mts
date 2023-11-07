import { defineConfig } from "vitepress";
import { nav } from "./relaConf";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sunsunmonkey blog",
  description: "Sunsunmonkey blog",
  themeConfig: {
    logo: "/imgs/avatar.png", // 表示docs/public/avartar.png
    // https://vitepress.dev/reference/default-theme-config
    nav: nav,

    sidebar: [
      {
        text: "一些文章",
        items: [
          { text: "对effect一点理解", link: "/FE/react-effect" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/sunsunmonkey" }],
  },
});

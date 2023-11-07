import { DefaultTheme } from "vitepress";
export const nav: DefaultTheme.NavItem[] = [
  {
    text: "首页",
    link: "/", // 表示docs/index.md
  },
  {
    text: "关于我",
    items: [
      {
        text: "语雀",
        link: "https://www.yuque.com/yuqueyonghuyrwudx",
      },
      { text: "掘金", link: "https://juejin.cn/user/1737670693755374" },
    ],
  },
];

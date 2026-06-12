# 新加坡韩式面部骨雕广告落地页

这是一个用于 Facebook / Instagram 广告投放的纯静态单页落地页。页面不展示体验价格，重点强化：

- 护理后当场观察脸部轮廓变化
- 不打针、不动刀、无恢复期
- 按脸型困扰引导查看相似真实案例
- 多处 WhatsApp 联系入口
- 8 秒后弹出 WhatsApp 案例咨询弹窗

## 上线前建议先改

打开 `index.html` 顶部的 `LP_CONFIG`：

```js
window.LP_CONFIG = {
  WHATSAPP_NUMBER: "60106519843",
  PREFILL_MESSAGE: "你好，我想咨询新加坡韩式面部骨雕。可以发我真实案例，并帮我判断我的脸型适不适合做吗？",
  POPUP_DELAY: 8000,
  AUTO_REDIRECT: false
};
```

`PREFILL_MESSAGE` 就是 WhatsApp 默认打招呼文案。页面里部分按钮有独立的 `data-wa-message`，会根据用户点击的案例类型自动带不同开场。

## 真实案例图片

当前页面没有伪造真实顾客前后图。案例区做成了 4 类真实案例入口：

- 浮肿脸、拍照显宽
- 下颌线模糊、侧脸不利落
- 双下巴感、脸颈线不清楚
- 咬肌紧、脸部疲态明显

如果你有顾客授权图片，建议替换案例卡片里的 Before / After 图片位，并确保：

- 同一人、同角度、同光线
- 不夸张修图
- 已获得顾客授权
- 页面保留“效果因人而异”的免责声明

## 素材文件

```text
assets/
├── hero.png       # AI 生成主视觉，不作为真实案例
├── og.jpg         # 社媒分享图
└── favicon.png    # 网站小图标
```

## Meta Pixel

`index.html` 里已预留 Pixel 代码位：

```html
<!-- META PIXEL: 替换 PIXEL_ID -->
```

把 `PIXEL_ID` 换成你的 Meta Pixel ID 后，每次点击 WhatsApp 按钮都会触发：

```js
fbq("track", "Contact")
```

## 部署

这是纯静态网站，无需 Node、无需构建。

Vercel 部署方式：

1. 上传本文件夹到 GitHub 仓库
2. Vercel 新建项目
3. Framework Preset 选择 `Other`
4. 无需 build command
5. 直接 Deploy

`vercel.json` 已保留静态配置。

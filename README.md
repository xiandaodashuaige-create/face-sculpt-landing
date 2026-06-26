# 新加坡韩式面部骨雕广告落地页

这是一个用于 Facebook / Instagram 广告投放的纯静态单页落地页。页面不展示体验价格，重点强化：

- 护理后当场观察脸部轮廓变化
- 不打针、不动刀、无恢复期
- 按脸型困扰引导查看相似真实案例
- 多处 WhatsApp 联系入口
- 用户进页约 60 秒后自动跳转 WhatsApp

## 上线前建议先改

打开 `index.html` 顶部的 `LP_CONFIG`：

```js
window.LP_CONFIG = {
  WHATSAPP_NUMBER: "60106519843",
  PREFILL_MESSAGE: "你好，我想咨询新加坡韩式面部骨雕。可以发我真实案例，并帮我判断我的脸型适不适合做吗？",
  AUTO_REDIRECT_DELAY: 60000,
  AUTO_REDIRECT: true,
  ENABLE_MODAL: false
};
```

`PREFILL_MESSAGE` 就是 WhatsApp 默认打招呼文案。页面里部分按钮有独立的 `data-wa-message`，会根据用户点击的案例类型自动带不同开场。

自动跳转逻辑说明：

- `AUTO_REDIRECT_DELAY: 60000`：进页 60 秒后自动跳转 WhatsApp。
- `AUTO_REDIRECT: true`：开启自动跳转。
- `ENABLE_MODAL: false`：不再弹出咨询窗，不打断客户选择。
- 页面上的 WhatsApp 按钮仍保留，客户如果 60 秒前就有兴趣，可以主动点击。

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

`index.html` 里已安装当前广告数据集 Pixel：

``` 
986266751045210
```

每次客户手动点击 WhatsApp 按钮都会触发：

```js
fbq("track", "Contact")
```

同时，手动点击 WhatsApp 按钮也会调用 Vercel 服务端接口：

```text
/api/meta-capi
```

这个接口会通过 Meta Conversions API 再发送同一个 `Contact`。浏览器 Pixel 和服务端 CAPI 会使用同一个 `event_id`，让 Meta 自动去重，避免一个点击被算成两次。

60 秒自动跳转 WhatsApp 不触发 `Contact`，也不调用 CAPI，避免广告后台把自动跳转误算成真实联系。

## Vercel 环境变量

Conversions API 需要在 Vercel 里设置：

```text
META_CAPI_TOKEN
META_DATASET_ID
```

你已经加过这两个变量的话，保留即可。  
可选测试变量：

```text
META_TEST_EVENT_CODE
```

如果你在 Meta「测试事件」里拿到了 Test Event Code，可以临时加这个变量，重新部署后测试服务端事件。测试结束后可以删除。

注意：`META_CAPI_TOKEN` 是敏感信息，只能放在 Vercel 环境变量里，不要写进 `index.html`。

## 去重版 CAPI 测试方式

部署后进入 Meta「测试事件」：

1. 打开网站，确认出现 `PageView`。
2. 手动点击任意 WhatsApp 按钮。
3. 正常情况下会看到 `Contact`，来源可能显示 Browser + Server。
4. 如果 Meta 显示去重成功，说明 `event_id` 匹配正常。
5. 等 60 秒自动跳 WhatsApp，不应该新增 `Contact`。

## 部署

这是纯静态网站，无需 Node、无需构建。

Vercel 部署方式：

1. 上传本文件夹到 GitHub 仓库
2. Vercel 新建项目
3. Framework Preset 选择 `Other`
4. 无需 build command
5. 直接 Deploy

`vercel.json` 已保留静态配置。

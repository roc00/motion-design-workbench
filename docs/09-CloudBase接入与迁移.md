# CloudBase 接入与迁移

## 已完成

- 已按官方 Setup Skill 安装 Codex CloudBase 插件（Skills + MCP）；CLI 3.8.6 已完成腾讯云账号授权。
- 国内站，上海区域；当前环境为用户创建的 ai-website-deploy，静态托管状态 online。
- 使用已有体验版环境；工具返回到期时间为 2027-04-12 23:59:59，自动续费关闭。环境不是永久免费状态；资源额度与费用以控制台实时数据为准。
- 复用与 Vercel 相同的已验证静态产物，174 个文件上传成功并通过远端一致性校验。根路径原有 6 个平台文件保留。
- 主站：https://ai-website-deploy-d7dblsa24f28f7-1255360638.tcloudbaseapp.com/
- 默认首页：完整词典，62 个词条；导演案例 7 个，叙事拆解 6 个。

## 默认域名访问

这是 CloudBase 的测试域名。首次浏览器访问实际出现“页面访问提示”，等待按钮倒计时后点击“确定访问”可进入。提示页不能视作网页故障，也不能承诺默认域名适合长期公开生产服务。

初次匿名命令行请求可能看到 Content-Disposition: attachment；正常浏览器确认提示后，页面 HTML 返回 text/html 且无 attachment，已经验证实际渲染。

## 后续发布

在项目根目录重新构建，然后更新同一环境的静态托管：

```bash
npm run build
tcb hosting deploy ./dist --env-id ai-website-deploy-d7dblsa24f28f7 --safe --verify --ignore .DS_Store
```

命令明确传递环境 ID；safe 在发布前备份，verify 校验文件一致性。保持当前平台文件，不使用 prune 删除其他内容。托管上传自身不提供应用版本管理，上传时入口文件放在资源之后。CloudBase 可用额度、续费和开通新套餐需要在控制台核实。

环境绑定记录为 .cloudbase/project.json，发布结果为 .cloudbase/publication.json。本次部署只使用静态托管；应用不依赖 CloudBase SDK、数据库或云函数。认证密钥与设备登录码不写入项目。

插件 MCP 在重启 Codex 后加载；本次已通过 CLI 完成实际部署。Vercel 与 Sites 记录保留，访问链接及维护方式见 docs/08-发布与维护.md。

## 验证记录

- 174/174 上传成功；verified=true，failedCount=0。
- 远端文件数 180，包含当前产物和原 6 个平台文件，__auth 与 cloud-admin 页面保留。
- 根地址 HTTP 200；registry 提供 62 个词条、7 个导演案例；MP4 返回 video/mp4。
- 实际浏览器确认提示后进入完整词典；缓动定位到 50%，群像定位 6.536 秒并播放，FORMA 定位 7.5 秒。
- 390px 无横向溢出；测试过程业务错误为 0。
- 按 CloudBase Code Review 检查：部署包无账户凭据，没有新增后台或 CloudBase SDK 调用；无需变更应用侧安全域名或数据库权限。确认提示后的 HTML 可以正常渲染。

## 最相关下一步

使用真实大陆网络打开主站，完成一次同事评审核对：提示页、完整词典、镜头组合与两个演示。当前代理浏览器验证通过，但未分别从移动、联通、电信直连线路实测。

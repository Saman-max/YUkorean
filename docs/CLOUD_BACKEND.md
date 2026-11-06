# 云端学习服务

## 已实现的产品结构

GitHub Pages 保留官网和访客学习入口；云端应用位于 `cloud-app/`，负责 ChatGPT 登录、数据库进度和 OpenAI 对话。公开访问不等于可以读取他人的数据：进度和对话接口都需要登录，并在每次查询中使用服务端取得的用户 ID。

云端站点：`https://yukorean-learning-saman.rarecairn8.chatgpt.site`。是否已发布、是否已完成 AI 凭证配置，以部署状态和 `/api/session` 返回结果为准。

## 课程

`public/curriculum-extended.js` 与 `public/learning-data.js` 共同提供 90 天独立编写的课程，分 9 章，共 270 道随堂练习、376 个词、42 个语法点、12 篇阅读和 38 道综合测验题。36 个情境分别定义人物、目标和开场。课程不是原产品付费题库的复制，也不是现场随机生成的占位内容。上线教学使用前仍应由韩语教师做专业审校。

每一天包含课程目标、韩语文本和翻译、词汇、目标语法、随堂选择题、朗读和个人句子笔记。全部随堂题答对后点亮完成状态。

## 登录与账户隔离

登录由 Sites 托管的 Sign in with ChatGPT 完成。应用不接收 ChatGPT 密码。身份以平台注入并由服务端读取的稳定用户 ID 为准，不接受客户端提交的身份。公开匿名请求可以浏览课程；读取和修改个人数据需要认证。

本地开发的 `local_seedy` 是 starter 仅在 loopback 开发服务器提供的测试身份。生产构建不包含这个模拟登录入口。

浏览器缓存使用 `yukorean-user:<userId>` 按账户隔离。退出登录后页面重新载入访客数据，不会把某个账户的记录留给下一个账户。首次登录不自动上传访客笔记；可由用户明确导入备份。

## 同步协议

- `GET /api/progress` 返回 `{state, revision, updatedAt}`。
- `PUT /api/progress` 必须提交读取到的 `revision`。数据库使用带版本条件的原子更新；版本过期返回 409 和最新快照。
- 客户端对字段的修改加设备时钟。已完成课程做并集合并，笔记和复习状态按最后修改合并，收藏的删除保留时间戳，防止另一台离线设备重新添加已删除项。
- 离线修改先保存到当前账户的本地缓存，恢复联网、页面重新激活或点击立即同步时重试。
- 用户仍可导出 JSON 备份。

## AI 对话

`POST /api/chat` 只接收场景 ID、消息、可选对话 ID 和请求 UUID。场景、角色和教学目标由服务端加载；历史从当前用户的数据库记录读取，不接受客户端伪造 assistant 历史。

服务端调用 OpenAI Responses API，使用 JSON Schema 返回韩语回复、中文翻译、纠错和下一句建议。`store:false`，API 密钥只存在服务端环境变量。默认模型为 `gpt-4.1-mini`，可调整 `OPENAI_MODEL`。模型可用性以对应 OpenAI 项目权限为准。

每位用户每日默认最多 100 次成功对话，失败会释放预占额度。相同请求 ID 可安全重试，不重复调用模型或重复保存消息。未配置密钥、额度不足、上游超时和拒绝回复都会显示明确错误，不回退为假 AI 回复。

对话及纠错保存到账号，可在情境页恢复历史会话。文字朗读使用设备 TTS；语音输入使用浏览器 SpeechRecognition，首次使用需由用户授予麦克风权限。该语音输入不是 OpenAI Realtime 语音通话。

## 配置与发布

敏感值通过托管服务的环境变量接口设置：

- `OPENAI_API_KEY`：secret，禁止提交源码。
- `OPENAI_MODEL`：默认 `gpt-4.1-mini`。
- `AI_DAILY_LIMIT`：默认 100，服务端上限 500。

本地可在 `cloud-app/.dev.vars` 配置，文件被 Git 忽略。请勿在 GitHub Pages 前端放置密钥。

运行 `node scripts/prepare-cloud.mjs` 同步前端与课程到云端应用，然后在 `cloud-app/` 执行依赖安装、`npm run db:generate`（仅 schema 变化时）、构建与 Sites 发布。已应用的迁移不可改写。

## 验证情况

已有自动化测试覆盖真实 SQLite 的身份隔离、版本冲突、非法请求、集合与删除合并、AI 请求格式、幂等、上游错误与额度。模型接口的自动化测试使用可控的模拟供应商，不能替代真实 OpenAI 凭证联调。真实模型验证与线上登录验证必须在配置实际凭证及部署后另外完成。

本地还通过 HTTP 验证未登录 401、跨源修改 403、登录身份和数据库持久化，并在浏览器核对登录后“已同步”以及笔记恢复。生产环境验收结果在交付时单独报告。

参考：[OpenAI Responses 文本生成](https://developers.openai.com/api/docs/guides/text?api-mode=responses)、[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses)、[GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini)。

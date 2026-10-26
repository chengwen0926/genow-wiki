# Genow v2 更新指南核对记录

核对日期：2026-10-26。用户章节：`content/updates/genow-v2.md`。

## 对照边界

- 旧版：genow 仓库保留分支 `codex/main-before-v2-20261024`，提交 `2b359d5`（2026-09-21，添加 GPT Image 2.5 Flare/Sunburst 模型）。
- 当前：genow / genow-v2 的已合入主线提交 `f8f897d`。两目录当前 HEAD 相同，不能直接以目录差异证明 v2 新增功能。
- 本章描述截至核对日期的整体 v2 使用体验，包含 v2 后续补齐的 Seedance 草稿与存储处理；不是仅某次合并的变更日志。
- 不根据规划文档中的待办宣称功能已经开放。不将模型名称出现、后端路由存在等同于用户拥有可用入口。没有进行真实付费生成或服务器迁移。

以下路径相对于业务仓库；旧版文件用 `git show 2b359d5:路径` 查阅，新增／移除路径用 `git diff --name-status 2b359d5 f8f897d` 复核。

| 结论 | 核对依据 |
| --- | --- |
| 控制台、项目空间、生成资产旧版已存在；Playground 和消息为后续新增；独立 sketch 页面移除 | `frontend/src/components/layout/Navbar.tsx`；`frontend/src/app/(main)/sketch/page.tsx` 的删除；新增 playground、notifications、shares 页面 |
| 旧版密钥设置仅本地输入，当前可保存与调用 | 旧版 `frontend/src/components/layout/settings/ModelSettings.tsx` 的 useState 输入，未调用保存服务；当前 `frontend/src/services/userCredentials.ts`、`backend/src/api/v1/user_credentials.py`；`docs/personal-provider-credentials.md` |
| 团队项目与共享素材新增 | 旧版 `frontend/src/app/(main)/canvas/page.tsx` 只列 documents；当前对应页面、`canvas/editor/UserAvatarsBar.tsx`、`canvas/panels/ProjectMaterialLibrary.tsx`；新增 canvas_materials / canvas_material_folders API |
| 提示词工具、模板、置顶流程新增 | 新增 `frontend/src/lib/console/promptBuilder.ts`、`frontend/src/services/promptTemplates.ts`、`frontend/src/services/consolePins.ts`、`docs/console-pins.md`；当前操作入口与手册 create/prompts、create/images 交叉核对 |
| 工作流导入不包含生成结果、导入后独立 | `frontend/src/components/canvas/templates/`、`frontend/src/services/workflowTemplates.ts`、`docs/workflow-template-execution-plan.md`；以当前拖入交互为准 |
| 涂抹标记保存为独立图片，不调用模型 | 当前画布工具及上一批真实组件演示，见 `docs/media-production/source-components-complete.json` 与 `content/create/canvas.md` |
| 下载、复制粘贴、智能比例及主体入口不应整体标为新增 | 旧版 history/page.tsx 已有批量下载／删除；CanvasEditor.tsx 已有复制粘贴；models.ts 已有智能比例、Seedance 及智能参考；旧树中已有 ViduSubjectPanel / KlingElementPanel |
| 新增视频草稿超分流程，非旧 sketch 功能 | `frontend/src/components/shared/generation/SeedanceFinalizeAction.tsx`：阶段判断、1080p、另行计费、过期／旧480p阻断；`VideoParamsPanel.tsx` 将 Seedance 2.5 的480p标为草稿；`canvas/panels/GenerationHistoryList.tsx` 接入超分操作 |
| 管理后台从旧三项扩展 | 对照 `frontend/src/app/(main)/admin/layout.tsx`：旧 Dashboard、用户管理、Seedance统计；当前模型、视频用量、提示词模板、存储、公告等；新增相关页面与接口 |
| 代码更新不意味着旧素材自动可用 | `docs/asset-storage-upgrade.md`；历史登记、存储身份与用量补齐需部署侧核对。用户文档不直接指导运行数据库变更 |

## 维护方式

新章节使用已有三张截图，增加一个正式路由与一个导航组；首页设独立入口，overview 增加老用户阅读链接。README 统计改为20篇；历史媒体批次的19篇验收记录保留原日期和含义。

后续更新应先锁定比较基线。新增、增强、入口迁移分别表述，避免将当前所有能力都称为 v2 首创；涉及模型可用性、权限、删除和迁移的承诺须再次核对实际实现。

# 附录 D 文档维护依据

本节供后续维护手册时定位实现，日常用户可跳过。界面名称和可执行步骤优先对照页面及组件；较早的设计文档可能保留旧版交互，不能直接将其中的规划当作现有按钮。

| 内容 | 主要位置 |
| --- | --- |
| 导航与个人设置 | 导航组件（`frontend/src/components/layout/Navbar.tsx`）、设置面板（`frontend/src/components/layout/SettingsPanel.tsx`）、设置组件目录（`frontend/src/components/layout/settings`） |
| 控制台与生成参数 | 控制台组件（`frontend/src/components/console`）、公共生成组件（`frontend/src/components/shared/generation`）、模型参数定义（`frontend/src/lib/shared/generation/models.ts`） |
| 提示词工具与模板 | 提示词构建规则（`frontend/src/lib/console/promptBuilder.ts`）、模板编辑器（`frontend/src/components/shared/templates/PromptTemplateEditor.tsx`）、模板选择入口（`frontend/src/components/console/toolbar/PromptTemplateUploadOption.tsx`） |
| 资产与删除 | 资产页面（`frontend/src/app/(main)/history/page.tsx`）、删除接口封装（`frontend/src/services/assetDeletion.ts`）、资产删除运行说明（`docs/asset-deletion-operations.md`）、个人素材库服务（`backend/src/services/assets/library.py`） |
| 画布与团队成员 | 画布编辑器（`frontend/src/components/canvas/editor/CanvasEditor.tsx`）、成员管理（`frontend/src/components/canvas/editor/UserAvatarsBar.tsx`）、项目素材界面（`frontend/src/components/canvas/panels/ProjectMaterialLibrary.tsx`） |
| 工作流模板 | 模板管理（`frontend/src/components/canvas/templates/WorkflowTemplateManager.tsx`）、模板编辑器（`frontend/src/components/canvas/templates/WorkflowTemplateEditor.tsx`）、自动保存（`frontend/src/services/workflowAutoSave.ts`） |
| 消息与站内分享 | 消息界面（`frontend/src/components/notifications`）、分享弹窗（`frontend/src/components/shared/display/MaterialShareDialog.tsx`）、分享权限服务（`backend/src/services/material_share_service.py`） |
| Playground | 作品页面组件（`frontend/src/components/playground`）、作品服务（`backend/src/services/playground_service.py`） |
| 管理后台 | 管理页面目录（`frontend/src/app/(main)/admin`）、公告管理界面（`frontend/src/components/notifications/AnnouncementPanel.tsx`） |

维护时优先检查：模型参数、当前入口、角色权限、共享范围、保存方式和删除语义。若这些发生变化，应同时更新操作章节、相关案例和速查表，避免只改目录而保留旧步骤。


用户手册于 2026-10-22 从 genow-v2 根目录迁入 content/。以上实现路径均相对于 genow-v2 仓库。后续用户说明统一维护在本仓库 content/，原始单文件手册作为迁移时的归档依据。

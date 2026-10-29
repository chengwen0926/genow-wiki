---
title: "供应商 API 文档"
description: "按供应商查找 Volcengine、MiniMax、Kling 和 Vidu 的 API 文档与积分说明。"
group: "reference"
order: 20
keywords: "供应商 服务商 API 接口 文档 volcengine 火山方舟 minimax kling 可灵 vidu Nano Banana Gemini OpenAI GPT Image got-image 积分"
---
# 供应商 API 文档

本章集中记录 Genow 所使用服务的 API 文档入口，按**接入供应商**分组，便于查找接口、鉴权及积分说明。链接整理于 **2026-10-29**。

文档中的能力和参数以供应商最新说明为准；Genow 当前开放的模型、参数及调用线路，以实际界面与管理员配置为准。供应商提供某项 API，不代表 Genow 已经开放对应功能。

## Volcengine（火山引擎）

[火山方舟文档中心](https://docs.volcengine.com/docs/ark?lang=zh)

从文档中心进入所需模型的开发指南或 API 参考，查阅模型调用、图片生成、视频生成等相关说明。

## MiniMax

[MiniMax API 接口概览](https://platform.minimax.cn/docs/api-reference/api-overview)

从接口概览查找对应能力，再进入具体接口说明。例如需要核对视频生成请求时，从概览中的视频模型部分继续查阅。

## Kling（可灵）

[Kling API 鉴权文档](https://klingai.com/document-api/api/get-started/authentication)

此链接作为 Kling 的 API 鉴权入口；需要查询具体生成接口时，可继续使用文档站内导航。

## Vidu

以下链接按提供时的用途和“from Gemini／from OpenAI”标注分别记录，统一归入 Vidu 供应商分组。不同文档应分别查阅，不将它们的参数或积分规则混用。

| 文档用途 | 链接 |
| --- | --- |
| Nano Banana 系列与 got-image 2.0 消耗积分 | [查看积分说明](https://shengshu.feishu.cn/wiki/CrfIwJ9ECiBKS3k92iycgqkunye) |
| GPT Image 2.5 系列 | [查看 GPT Image 2.5 系列文档](https://shengshu.feishu.cn/wiki/RKpZwiBScigAlfkPMrPcDdJ7nSf) |
| Nano Banana 系列 · from Gemini | [查看 Gemini 标注文档](https://shengshu.feishu.cn/wiki/ScErwbsZQikKm8k8v64ccP5rnvm) |
| Nano Banana 系列 · from OpenAI | [查看 OpenAI 标注文档](https://shengshu.feishu.cn/wiki/WAFiwoDrjigZIYkSRWFc3jlmnmg) |

积分条目中的 `got-image 2.0` 沿用提供时的名称，具体模型名称请以原文为准。本页只收录文档入口，不复制固定积分数值，避免供应商调整后仍引用旧数值。

**查阅例子：** 需要核对 Nano Banana 的积分消耗时，先打开第一条；需要查阅对应接入说明时，再按实际使用的 Gemini／OpenAI 标注选择文档。不要仅凭模型名称相近就套用另一份文档。

飞书文档如提示登录或申请权限，请使用有访问权限的账号，或联系文档提供方。

## 相关手册

- [配置个人模型密钥](/wiki/start/account/#配置个人模型密钥)：了解 Genow 内的密钥设置入口及状态操作。
- [用户、模型与用量](/wiki/admin/platform/)：了解管理员如何查看模型和服务商配置。
- [控制台图片生成](/wiki/create/images/)与[控制台视频生成](/wiki/create/videos/)：查阅 Genow 界面的具体操作。

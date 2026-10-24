#!/usr/bin/env python3
"""Genow Wiki 一键安装、构建和启动（Python 3.9+，仅使用标准库）。"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent


def port_number(value: str) -> int:
    try:
        port = int(value)
    except ValueError:
        raise argparse.ArgumentTypeError("端口必须是整数")
    if not 1 <= port <= 65535:
        raise argparse.ArgumentTypeError("端口必须在 1–65535 之间")
    return port


def spawn(command: list[str], **kwargs) -> subprocess.Popen:
    # 隔离本脚本的进程组，退出时只清理自己启动的服务。
    return subprocess.Popen(command, cwd=ROOT, start_new_session=os.name != "nt", **kwargs)


def stop(process: subprocess.Popen) -> None:
    if os.name == "nt":
        if process.poll() is None:
            subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
    try:
        process.wait(timeout=8)
    except subprocess.TimeoutExpired:
        if os.name == "nt":
            process.kill()
        else:
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
        process.wait()


def run_step(label: str, command: list[str]) -> None:
    print(f"\n→ {label}", flush=True)
    process = spawn(command)
    try:
        code = process.wait()
        if code:
            raise RuntimeError(f"{label}失败（退出码 {code}），已停止后续步骤。")
    finally:
        stop(process)


def main() -> int:
    parser = argparse.ArgumentParser(description="安装依赖、构建并启动 Genow Wiki，默认部署模式监听 0.0.0.0:3002。")
    parser.add_argument("--dev", action="store_true", help="启动开发模式；仍先构建以生成搜索索引")
    parser.add_argument("--port", type=port_number, default=3002, help="监听端口（默认 3002）")
    parser.add_argument("--skip-install", action="store_true", help="跳过依赖安装，使用已有 node_modules")
    parser.add_argument("--skip-build", action="store_true", help="跳过构建，使用已有页面和搜索索引")
    args = parser.parse_args()

    node, npm = shutil.which("node"), shutil.which("npm")
    if not node or not npm:
        raise RuntimeError("请先安装 Node.js 22.13+ 和 npm，再运行本脚本。")
    version = subprocess.check_output([node, "--version"], text=True).strip()
    if tuple(int(v) for v in version.lstrip("v").split(".")[:2]) < (22, 13):
        raise RuntimeError(f"当前 Node.js 为 {version}，需要 22.13+。")
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        if os.name != "nt":
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(("0.0.0.0", args.port))
        except OSError as exc:
            raise RuntimeError(f"无法使用端口 {args.port}：{exc}。请确认并停止旧 Wiki 服务后重试；不会自动结束其他进程或换端口。") from exc

    print(f"Genow Wiki · {'开发' if args.dev else '部署'}模式 · 端口 {args.port}", flush=True)
    if not args.skip_install:
        run_step("安装前端依赖", [npm, "run", "setup"])
    if not args.skip_build:
        run_step("构建页面、媒体和搜索索引", [npm, "run", "build"])
    if not args.dev and not (ROOT / "frontend/out/index.html").is_file():
        raise RuntimeError("未找到构建产物，请去掉 --skip-build 后重试。")

    log_dir = ROOT / "log"
    log_dir.mkdir(exist_ok=True)
    log_path = log_dir / "frontend.log"
    script = "dev.mjs" if args.dev else "preview.mjs"
    command = [node, str(ROOT / "frontend/scripts" / script)]
    if not args.dev:
        command.append("--production")
    command.extend(["--port", str(args.port)])
    print(f"\n→ 启动服务，日志：{log_path}", flush=True)
    # 直接启动 Node 入口，避免额外的 npm 包装进程影响停止和退出码。
    with log_path.open("a", encoding="utf-8") as log:
        process = spawn(command, stdout=log, stderr=subprocess.STDOUT)
        try:
            opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
            deadline = time.monotonic() + 90
            while True:
                if process.poll() is not None:
                    raise RuntimeError(f"服务启动失败（退出码 {process.returncode}），请查看 {log_path}。")
                try:
                    with opener.open(f"http://127.0.0.1:{args.port}/", timeout=2) as response:
                        ready = response.status == 200
                    if ready and process.poll() is None:
                        break
                except (OSError, urllib.error.URLError):
                    pass
                if time.monotonic() >= deadline:
                    raise RuntimeError(f"服务 90 秒内未就绪，请查看 {log_path}。")
                time.sleep(0.3)
            print(f"✓ 服务已就绪：http://localhost:{args.port}\n"
                  f"  监听 0.0.0.0:{args.port}，按 Ctrl+C 停止。\n"
                  "  原域名需继续转发到这台服务器的相同端口。", flush=True)
            code = process.wait()
            raise RuntimeError(f"服务已退出（退出码 {code}），请查看 {log_path}。")
        finally:
            stop(process)


def handle_signal(number, _frame):
    raise SystemExit(128 + number)


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, handle_signal)
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n服务已停止。", flush=True)
        sys.exit(130)
    except (RuntimeError, OSError, subprocess.SubprocessError) as exc:
        print(f"\n启动失败：{exc}", file=sys.stderr)
        sys.exit(1)

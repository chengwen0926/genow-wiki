#!/usr/bin/env python3
"""
Genow Wiki 安装与启动脚本

用法：
    uv run python setup.py
    python setup.py
"""

from __future__ import annotations

import os
import shutil
import signal
import subprocess
import sys
import time
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
LOG_DIR = ROOT / "log"

TOTAL_STEPS = 5

RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
RED = "\033[31m"
CYAN = "\033[36m"

_bg_procs: list[subprocess.Popen] = []


def _cleanup(sig=None, frame=None) -> None:
    if _bg_procs:
        print(f"\n{YELLOW}正在停止后台服务...{RESET}")
        for proc in _bg_procs:
            try:
                proc.terminate()
            except Exception:
                pass
    sys.exit(0)


signal.signal(signal.SIGINT, _cleanup)
signal.signal(signal.SIGTERM, _cleanup)


def ok(msg: str) -> None:
    print(f"  {GREEN}✓{RESET}  {msg}")


def info(msg: str) -> None:
    print(f"  {CYAN}→{RESET}  {msg}")


def warn(msg: str) -> None:
    print(f"  {YELLOW}!{RESET}  {msg}")


def fail(msg: str) -> None:
    print(f"\n  {RED}✗{RESET}  {msg}")
    sys.exit(1)


def header() -> None:
    b = f"{BOLD}{CYAN}"
    print(f"\n{b}╔══════════════════════════════════════════╗{RESET}")
    print(f"{b}║         Genow Wiki Setup  v1.0          ║{RESET}")
    print(f"{b}╚══════════════════════════════════════════╝{RESET}\n")


def step_header(n: int, title: str) -> None:
    print(f"\n{BOLD}{CYAN}[{n}/{TOTAL_STEPS}] {title}{RESET}")
    print(f"  {DIM}{'─' * 44}{RESET}")


def prompt(question: str, default: str = "") -> str:
    hint = f" {DIM}[{default}]{RESET}" if default else ""
    try:
        value = input(f"  {YELLOW}?{RESET}  {question}{hint}: ").strip()
    except EOFError:
        value = ""
    return value or default


def confirm(question: str, default: bool = True) -> bool:
    hint = f"{DIM}[Y/n]{RESET}" if default else f"{DIM}[y/N]{RESET}"
    try:
        value = input(f"  {YELLOW}?{RESET}  {question} {hint}: ").strip().lower()
    except EOFError:
        return default
    return default if not value else value in {"y", "yes"}


def cmd_available(name: str) -> bool:
    return shutil.which(name) is not None


def run(
    cmd: list[str] | str,
    cwd: Path | None = None,
    capture: bool = False,
    check: bool = True,
) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(
            cmd,
            cwd=cwd,
            check=check,
            capture_output=capture,
            text=capture,
            shell=isinstance(cmd, str) or sys.platform == "win32",
        )
    except subprocess.CalledProcessError as exc:
        stderr = (exc.stderr or "").strip()
        fail(f"命令失败: {cmd}\n{stderr}")
        raise


def http_ok(url: str, timeout: int = 3) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return response.status < 500
    except Exception:
        return False


def wait_for(url: str, label: str, timeout: int = 90) -> bool:
    info(f"等待 {label} 就绪...")
    for i in range(timeout):
        if http_ok(url):
            ok(f"{label} 已就绪")
            return True
        time.sleep(1)
        if i > 0 and i % 15 == 14:
            print(f"    {DIM}仍在等待... ({i + 1}s / {timeout}s){RESET}")
    warn(f"{label} 未在 {timeout}s 内响应，请查看日志")
    return False


def write_frontend_env(path: Path, api_url: str) -> None:
    path.write_text(
        "\n".join(
            [
                "# 前端配置（由 setup.py 生成）",
                f"NEXT_PUBLIC_API_URL={api_url}",
                "",
            ]
        ),
        encoding="utf-8",
    )


def check_prerequisites() -> None:
    step_header(1, "检查前置依赖")

    checks = [
        ("uv", "uv"),
        ("node", "Node.js"),
        ("npm", "npm"),
    ]

    missing: list[str] = []
    for cmd, label in checks:
        if cmd_available(cmd):
            result = run([cmd, "--version"], capture=True, check=False)
            version = (result.stdout or "").strip().splitlines()[0] if result.returncode == 0 else ""
            ok(f"{label}  {DIM}{version}{RESET}")
        else:
            missing.append(label)
            print(f"  {RED}✗{RESET}  {label}  {RED}未找到{RESET}")

    if missing:
        fail(f"缺少前置依赖：{', '.join(missing)}")


def configure_frontend() -> tuple[str, int, int]:
    step_header(2, "配置启动参数")

    frontend_env_path = FRONTEND_DIR / ".env.local"
    default_backend_port = 8002
    default_frontend_port = 3002

    backend_host = prompt("后端 Host", default="0.0.0.0")
    backend_port = int(prompt("后端 Port", default=str(default_backend_port)))
    frontend_port = int(prompt("前端 Port", default=str(default_frontend_port)))
    server_ip = prompt("服务器内网 IP 或域名（供浏览器访问，留空则用 localhost）", default="")
    if server_ip:
        api_url = prompt("前端 API 地址", default=f"http://{server_ip}:{backend_port}")
    else:
        api_url = prompt("前端 API 地址", default=f"http://localhost:{backend_port}")

    write_frontend_env(frontend_env_path, api_url)
    ok(f"frontend/.env.local 已写入")

    return backend_host, backend_port, frontend_port, server_ip


def install_backend_dependencies() -> None:
    step_header(3, "安装后端依赖")

    info("uv sync...")
    run(["uv", "sync"], cwd=BACKEND_DIR)
    ok("后端依赖同步完成")


def install_frontend_dependencies() -> None:
    step_header(4, "安装前端依赖")

    info("npm install...")
    run(["npm", "install"], cwd=FRONTEND_DIR)
    ok("前端依赖安装完成")


def start_services(backend_host: str, backend_port: int, frontend_port: int, server_ip: str = "") -> None:
    step_header(5, "启动前后端服务")

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    shell = sys.platform == "win32"

    backend_log_path = LOG_DIR / "backend.log"
    info(f"启动后端  {DIM}(日志 → {backend_log_path.relative_to(ROOT)}){RESET}")
    backend_log = open(backend_log_path, "a", encoding="utf-8")
    backend_proc = subprocess.Popen(
        ["uv", "run", "python", "main.py"],
        cwd=BACKEND_DIR,
        stdout=backend_log,
        stderr=backend_log,
        shell=shell,
        env={
            **os.environ,
            "HOST": backend_host,
            "PORT": str(backend_port),
            "RELOAD": "false",
            "CORS_ORIGINS": (
                f"http://localhost:{frontend_port},http://127.0.0.1:{frontend_port}"
                + (f",http://{server_ip}:{frontend_port}" if server_ip else "")
            ),
            "PYTHONIOENCODING": "utf-8",
        },
    )
    _bg_procs.append(backend_proc)

    info("构建前端...")
    run(["npm", "run", "build"], cwd=FRONTEND_DIR)
    ok("前端构建完成")

    frontend_log_path = LOG_DIR / "frontend.log"
    info(f"启动前端  {DIM}(日志 → {frontend_log_path.relative_to(ROOT)}){RESET}")
    frontend_log = open(frontend_log_path, "a", encoding="utf-8")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "start", "--", "-p", str(frontend_port)],
        cwd=FRONTEND_DIR,
        stdout=frontend_log,
        stderr=frontend_log,
        shell=shell,
    )
    _bg_procs.append(frontend_proc)

    backend_ok = wait_for(f"http://localhost:{backend_port}/api/health", "后端", timeout=60)
    frontend_ok = wait_for(f"http://localhost:{frontend_port}", "前端", timeout=90)

    print(f"\n  {DIM}{'─' * 44}{RESET}")
    print(f"\n  {BOLD}{GREEN}启动完成！{RESET}\n")

    entries = [
        ("前端应用", f"http://localhost:{frontend_port}", frontend_ok),
        ("后端 API", f"http://localhost:{backend_port}", backend_ok),
        ("健康检查", f"http://localhost:{backend_port}/api/health", backend_ok),
    ]
    for label, url, ready in entries:
        status = f"{GREEN}✓{RESET}" if ready else f"{YELLOW}?{RESET}"
        print(f"  {status}  {BOLD}{label:<12}{RESET}  {CYAN}{url}{RESET}")

    print(f"\n  {DIM}日志目录：{LOG_DIR.relative_to(ROOT)}/{RESET}")
    print(f"  {DIM}按 Ctrl+C 停止所有后台服务{RESET}\n")

    try:
        while True:
            time.sleep(5)
            for proc in _bg_procs:
                if proc.poll() is not None:
                    name = "后端" if proc is backend_proc else "前端"
                    warn(f"{name}进程已意外退出（exit code {proc.returncode}），请查看日志")
    except KeyboardInterrupt:
        _cleanup()


def main() -> None:
    header()
    print(f"  {DIM}本脚本会为当前 Genow Wiki 项目安装依赖并启动前后端。{RESET}")
    print(f"  {DIM}所有输入都可以直接回车使用默认值。{RESET}\n")

    if not confirm("开始安装并启动？"):
        print("  已取消。\n")
        sys.exit(0)

    check_prerequisites()
    backend_host, backend_port, frontend_port, server_ip = configure_frontend()
    install_backend_dependencies()
    install_frontend_dependencies()
    start_services(backend_host, backend_port, frontend_port, server_ip)
if __name__ == "__main__":
    main()

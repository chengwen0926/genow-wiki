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


# ─────────────────────────────────────────────────────────────────────────────
# 路径常量
# ─────────────────────────────────────────────────────────────────────────────

ROOT         = Path(__file__).resolve().parent
BACKEND_DIR  = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
LOG_DIR      = ROOT / "log"

TOTAL_STEPS = 7

# ─────────────────────────────────────────────────────────────────────────────
# ANSI 颜色
# ─────────────────────────────────────────────────────────────────────────────

RESET  = "\033[0m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
GREEN  = "\033[32m"
YELLOW = "\033[33m"
RED    = "\033[31m"
CYAN   = "\033[36m"

# ─────────────────────────────────────────────────────────────────────────────
# 后台进程注册表（用于 Ctrl+C 清理）
# ─────────────────────────────────────────────────────────────────────────────

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

# ─────────────────────────────────────────────────────────────────────────────
# UI 工具函数
# ─────────────────────────────────────────────────────────────────────────────

def ok(msg: str)   -> None: print(f"  {GREEN}✓{RESET}  {msg}")
def info(msg: str) -> None: print(f"  {CYAN}→{RESET}  {msg}")
def warn(msg: str) -> None: print(f"  {YELLOW}!{RESET}  {msg}")


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

# ─────────────────────────────────────────────────────────────────────────────
# 系统工具函数
# ─────────────────────────────────────────────────────────────────────────────

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

# ─────────────────────────────────────────────────────────────────────────────
# .env 文件读写
# ─────────────────────────────────────────────────────────────────────────────

def read_env(path: Path) -> dict[str, str]:
    result: dict[str, str] = {}
    if not path.exists():
        return result
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        k, _, v = line.partition("=")
        result[k.strip()] = v.strip()
    return result


def write_backend_env(path: Path, cfg: dict[str, str]) -> None:
    content = "\n".join([
        "# 后端配置（由 setup.py 生成）",
        f"HOST={cfg.get('HOST', '0.0.0.0')}",
        f"PORT={cfg.get('PORT', '8002')}",
        f"RELOAD={cfg.get('RELOAD', 'false')}",
        f"CORS_ORIGINS={cfg.get('CORS_ORIGINS', '')}",
    ])
    path.write_text(content + "\n", encoding="utf-8")


def write_frontend_env(path: Path, api_url: str, label: str) -> None:
    path.write_text(
        "\n".join([
            f"# {label}（由 setup.py 生成）",
            f"NEXT_PUBLIC_API_URL={api_url}",
            "",
        ]),
        encoding="utf-8",
    )

# ─────────────────────────────────────────────────────────────────────────────
# STEP 0 — 选择运行环境
# ─────────────────────────────────────────────────────────────────────────────

def select_mode() -> str:
    print(f"\n{BOLD}{CYAN}  请选择运行环境{RESET}")
    print(f"  {DIM}{'─' * 44}{RESET}")
    print(f"  {BOLD}1{RESET}  本地开发  {DIM}(npm run dev，使用 localhost){RESET}")
    print(f"  {BOLD}2{RESET}  内网部署  {DIM}(npm run build + start，使用服务器 IP){RESET}")
    try:
        choice = input(f"\n  {YELLOW}?{RESET}  请输入 1 或 2 {DIM}[1]{RESET}: ").strip()
    except EOFError:
        choice = ""
    return "prod" if choice == "2" else "dev"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — 检查前置依赖
# ─────────────────────────────────────────────────────────────────────────────

def check_prerequisites() -> None:
    step_header(1, "检查前置依赖")

    checks = [
        ("uv",   "uv"),
        ("node", "Node.js"),
        ("npm",  "npm"),
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

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — 配置后端环境变量
# ─────────────────────────────────────────────────────────────────────────────

def configure_backend(mode: str) -> dict[str, str]:
    step_header(2, "配置后端环境变量")

    backend_env_path = BACKEND_DIR / ".env"
    existing = read_env(backend_env_path)

    if backend_env_path.exists():
        warn("检测到已有 backend/.env")
        if not confirm("是否重新配置？（选 N 保留现有配置）", default=False):
            ok("保留现有 backend/.env，跳过此步骤")
            return existing

    is_prod = mode == "prod"
    default_host = "0.0.0.0" if is_prod else existing.get("HOST", "127.0.0.1")
    default_cors = existing.get(
        "CORS_ORIGINS",
        '["http://localhost:3002","http://127.0.0.1:3002"]' if not is_prod
        else '["http://localhost:3002","http://127.0.0.1:3002","http://192.168.101.206:3002"]',
    )

    cfg: dict[str, str] = {}
    cfg["HOST"] = prompt("后端监听地址", default=default_host)
    cfg["PORT"] = prompt("后端端口",     default=existing.get("PORT", "8002"))
    cfg["RELOAD"] = "false"
    cfg["CORS_ORIGINS"] = prompt("CORS 允许的来源（JSON 数组格式）", default=default_cors)

    write_backend_env(backend_env_path, cfg)
    ok("backend/.env 已写入")
    return cfg

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — 配置前端环境变量
# ─────────────────────────────────────────────────────────────────────────────

def configure_frontend(mode: str) -> None:
    step_header(3, "配置前端环境变量")

    is_prod = mode == "prod"

    if is_prod:
        env_path   = FRONTEND_DIR / ".env.production.local"
        env_label  = "生产环境配置"
        default_url_key = "NEXT_PUBLIC_API_URL"
        existing   = read_env(env_path)
        default_api = existing.get(default_url_key, "http://192.168.101.206:8002")
        hint = "浏览器可访问的服务器内网 IP"
    else:
        env_path   = FRONTEND_DIR / ".env.development.local"
        env_label  = "本地开发配置"
        existing   = read_env(env_path)
        default_api = existing.get("NEXT_PUBLIC_API_URL", "http://localhost:8002")
        hint = "本地后端地址"

    api_url = prompt(f"后端 API 地址（{hint}）", default=default_api)
    write_frontend_env(env_path, api_url, env_label)
    ok(f"{env_path.name} 已写入  {DIM}→ {api_url}{RESET}")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — 安装后端依赖
# ─────────────────────────────────────────────────────────────────────────────

def install_backend_dependencies() -> None:
    step_header(4, "安装后端依赖")
    info("uv sync...")
    run(["uv", "sync"], cwd=BACKEND_DIR)
    ok("后端依赖同步完成")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5 — 安装前端依赖
# ─────────────────────────────────────────────────────────────────────────────

def install_frontend_dependencies() -> None:
    step_header(5, "安装前端依赖")
    info("npm install...")
    run(["npm", "install"], cwd=FRONTEND_DIR)
    ok("前端依赖安装完成")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6 — 构建前端（仅生产模式）
# ─────────────────────────────────────────────────────────────────────────────

def build_frontend(mode: str) -> None:
    if mode != "prod":
        step_header(6, "构建前端（跳过，开发模式使用 npm run dev）")
        ok("跳过")
        return

    step_header(6, "构建前端（生产）")
    info("npm run build（此步骤需要 1-2 分钟，请耐心等待）...")
    run(["npm", "run", "build"], cwd=FRONTEND_DIR)
    ok("前端构建完成")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 7 — 启动前后端服务
# ─────────────────────────────────────────────────────────────────────────────

def kill_port(port: int) -> None:
    """杀掉占用指定端口的进程（跨平台）。"""
    if sys.platform == "win32":
        subprocess.run(
            f"for /f \"tokens=5\" %a in ('netstat -ano ^| findstr :{port}') do taskkill /F /PID %a",
            shell=True, capture_output=True,
        )
        return

    # Linux: 优先用 fuser
    r = subprocess.run(["fuser", "-k", f"{port}/tcp"], capture_output=True)
    if r.returncode == 0:
        return

    # macOS / Linux fallback: lsof
    r = subprocess.run(["lsof", "-ti", f":{port}"], capture_output=True, text=True)
    pids = r.stdout.strip()
    if pids:
        subprocess.run(["kill", "-9"] + pids.split(), capture_output=True)


def start_services(mode: str, backend_port: int = 8002) -> None:
    step_header(7, "启动前后端服务")

    info("清理旧进程...")
    kill_port(backend_port)
    kill_port(3002)
    time.sleep(1)
    ok("端口已释放")

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    shell = sys.platform == "win32"
    clean_env = {k: v for k, v in os.environ.items() if k != "VIRTUAL_ENV"}

    backend_log_path = LOG_DIR / "backend.log"
    info(f"启动后端  {DIM}(日志 → {backend_log_path.relative_to(ROOT)}){RESET}")
    backend_log = open(backend_log_path, "a", encoding="utf-8")
    backend_proc = subprocess.Popen(
        ["uv", "run", "python", "main.py"],
        cwd=BACKEND_DIR,
        stdout=backend_log,
        stderr=backend_log,
        shell=shell,
        env={**clean_env, "PYTHONIOENCODING": "utf-8"},
    )
    _bg_procs.append(backend_proc)

    frontend_log_path = LOG_DIR / "frontend.log"
    frontend_cmd = ["npm", "run", "start"] if mode == "prod" else ["npm", "run", "dev"]
    mode_label   = "start（生产）" if mode == "prod" else "dev（开发，支持热更新）"
    info(f"启动前端  {DIM}npm run {mode_label}  (日志 → {frontend_log_path.relative_to(ROOT)}){RESET}")
    frontend_log = open(frontend_log_path, "a", encoding="utf-8")
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=FRONTEND_DIR,
        stdout=frontend_log,
        stderr=frontend_log,
        shell=shell,
    )
    _bg_procs.append(frontend_proc)

    backend_ok  = wait_for(f"http://localhost:{backend_port}/api/health", "后端", timeout=60)
    frontend_ok = wait_for("http://localhost:3002",                        "前端", timeout=90)

    print(f"\n  {DIM}{'─' * 44}{RESET}")
    print(f"\n  {BOLD}{GREEN}启动完成！{RESET}\n")

    entries = [
        ("前端应用", "http://localhost:3002",                         frontend_ok),
        ("后端 API", f"http://localhost:{backend_port}",             backend_ok),
        ("健康检查", f"http://localhost:{backend_port}/api/health",  backend_ok),
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

# ─────────────────────────────────────────────────────────────────────────────
# 主入口
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    header()
    print(f"  {DIM}本脚本会为当前 Genow Wiki 项目安装依赖并启动前后端。{RESET}")
    print(f"  {DIM}所有输入都可以直接回车使用默认值。{RESET}\n")

    mode = select_mode()
    mode_label = f"{BOLD}{'内网部署（生产）' if mode == 'prod' else '本地开发'}{RESET}"
    print(f"\n  已选择：{mode_label}\n")

    if not confirm("开始安装并启动？"):
        print("  已取消。\n")
        sys.exit(0)

    check_prerequisites()                        # Step 1
    cfg = configure_backend(mode)                # Step 2
    configure_frontend(mode)                     # Step 3
    install_backend_dependencies()               # Step 4
    install_frontend_dependencies()              # Step 5
    build_frontend(mode)                         # Step 6
    start_services(mode, backend_port=int(cfg.get("PORT", "8002")))  # Step 7


if __name__ == "__main__":
    main()

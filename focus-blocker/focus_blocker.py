#!/usr/bin/env python3
"""Focus Blocker — companion to pomodoro.html.

Blocks distracting apps and websites on YOUR OWN computer while you study.
During a focus session it repeatedly closes the apps on your blocklist and
redirects blocked websites to localhost via the hosts file. Everything is
restored automatically when the session ends (or on Ctrl+C).

Usage:
    python focus_blocker.py 25            # block for 25 minutes
    python focus_blocker.py 50 --list my-blocklist.txt

Blocklist format (one entry per line, download it from the web app's
Settings > Blocklist section):
    app:Discord.exe
    app:steam
    site:youtube.com
    site:tiktok.com

Notes:
  * Site blocking edits the hosts file, so run as Administrator (Windows)
    or with sudo (macOS/Linux). App blocking works without admin rights.
  * A backup of the hosts file is written next to it before any change.
  * This tool is for blocking distractions on your own machine only.
"""

import argparse
import atexit
import platform
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path

WINDOWS = platform.system() == "Windows"
HOSTS = Path(r"C:\Windows\System32\drivers\etc\hosts") if WINDOWS else Path("/etc/hosts")
MARK_BEGIN = "# >>> focus-blocker begin >>>"
MARK_END = "# <<< focus-blocker end <<<"
POLL_SECONDS = 3

DEFAULT_BLOCKLIST = """\
app:Discord.exe
site:youtube.com
site:instagram.com
site:tiktok.com
"""


def parse_blocklist(path):
    if path and Path(path).exists():
        text = Path(path).read_text(encoding="utf-8")
    else:
        if path:
            print(f"Blocklist '{path}' not found - using built-in defaults.")
        text = DEFAULT_BLOCKLIST
    apps, sites = [], []
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.lower().startswith("app:"):
            apps.append(line[4:].strip())
        elif line.lower().startswith("site:"):
            sites.append(line[5:].strip().lstrip("*."))
    return apps, sites


def kill_apps(apps):
    for app in apps:
        try:
            if WINDOWS:
                name = app if app.lower().endswith(".exe") else app + ".exe"
                subprocess.run(["taskkill", "/IM", name, "/F"],
                               capture_output=True, check=False)
            else:
                subprocess.run(["pkill", "-if", app], capture_output=True, check=False)
        except OSError:
            pass


def block_sites(sites):
    if not sites:
        return False
    try:
        original = HOSTS.read_text(encoding="utf-8")
    except PermissionError:
        print("! No permission to read the hosts file - site blocking skipped.")
        return False
    if MARK_BEGIN not in original:
        shutil.copy2(HOSTS, HOSTS.with_suffix(".focus-blocker.bak"))
        lines = [MARK_BEGIN]
        for s in sites:
            lines.append(f"127.0.0.1 {s}")
            lines.append(f"127.0.0.1 www.{s}")
        lines.append(MARK_END)
        try:
            HOSTS.write_text(original.rstrip() + "\n" + "\n".join(lines) + "\n",
                             encoding="utf-8")
        except PermissionError:
            print("! Run as Administrator/sudo to enable site blocking - skipped.")
            return False
    flush_dns()
    return True


def unblock_sites():
    try:
        text = HOSTS.read_text(encoding="utf-8")
        if MARK_BEGIN not in text:
            return
        head, _, rest = text.partition(MARK_BEGIN)
        _, _, tail = rest.partition(MARK_END)
        HOSTS.write_text(head.rstrip() + "\n" + tail.lstrip(), encoding="utf-8")
        flush_dns()
        print("Sites unblocked, hosts file restored.")
    except (OSError, PermissionError):
        print("! Could not restore the hosts file automatically. Restore it from "
              f"the backup at {HOSTS.with_suffix('.focus-blocker.bak')}")


def flush_dns():
    try:
        if WINDOWS:
            subprocess.run(["ipconfig", "/flushdns"], capture_output=True, check=False)
        elif platform.system() == "Darwin":
            subprocess.run(["dscacheutil", "-flushcache"], capture_output=True, check=False)
    except OSError:
        pass


def main():
    parser = argparse.ArgumentParser(description="Block distracting apps/sites while you focus.")
    parser.add_argument("minutes", type=float, help="length of the focus session in minutes")
    parser.add_argument("--list", default="blocklist.txt",
                        help="path to blocklist.txt (default: ./blocklist.txt)")
    args = parser.parse_args()

    apps, sites = parse_blocklist(args.list)
    print(f"Focus session: {args.minutes:g} min")
    print(f"  Apps to keep closed : {', '.join(apps) or '(none)'}")
    print(f"  Sites to block      : {', '.join(sites) or '(none)'}")

    atexit.register(unblock_sites)
    signal.signal(signal.SIGINT, lambda *_: sys.exit(0))
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))

    if block_sites(sites):
        print("  Site blocking       : ON (hosts file)")

    end = time.time() + args.minutes * 60
    while time.time() < end:
        kill_apps(apps)
        remaining = int(end - time.time())
        print(f"\r  Focusing... {remaining // 60:02d}:{remaining % 60:02d} left  ",
              end="", flush=True)
        time.sleep(POLL_SECONDS)

    print("\nSession complete - nice work!")


if __name__ == "__main__":
    main()

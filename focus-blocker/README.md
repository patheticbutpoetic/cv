# Focus Blocker (desktop companion)

The web app at [`pomodoro.html`](../pomodoro.html) tracks your focus and catches
tab-switching, but a web page **cannot close other programs** on your computer.
This small Python script does that part: while a focus session runs, it keeps
distracting apps closed and blocks distracting websites system-wide.

## Setup

1. Install Python 3.8+ (python.org). No extra packages needed.
2. In the web app, fill in **Settings → Blocklist** and click
   **Download blocklist.txt**. Put that file next to `focus_blocker.py`.

## Usage

```
# Windows (run the terminal as Administrator for site blocking):
python focus_blocker.py 25

# macOS / Linux:
sudo python3 focus_blocker.py 25
```

Start it at the same time as your pomodoro in the web app (e.g. `25` for a
classic focus session, `50` for deep work).

## What it does

- **Apps** (`app:` lines): closes them immediately and re-closes them every few
  seconds if you try to reopen them (e.g. `app:Discord.exe`, `app:steam`).
- **Sites** (`site:` lines): points them at `127.0.0.1` in the hosts file so the
  browser can't reach them (e.g. `site:youtube.com`).
- When the session ends — or you press Ctrl+C — the hosts file is restored
  automatically. A backup copy (`hosts.focus-blocker.bak`) is created before the
  first change, just in case.

App blocking works without admin rights; site blocking needs
Administrator/sudo because the hosts file is protected.

This tool is for managing distractions on **your own machine**.

"""Repository-owned subprocess regression fixture. Never accepts or executes code."""
import json
import os
from pathlib import Path
import sys
import time

command = json.load(sys.stdin)
action = command["action"]
if action == "environment":
    print(json.dumps({"secret": os.getenv("NEXUS_TEST_SECRET"),
                      "pythonpath": os.getenv("PYTHONPATH"),
                      "db": os.getenv("NEXUS_COMMERCE_DB"),
                      "isolated": sys.flags.isolated}))
elif action == "sleep":
    time.sleep(30)
elif action == "output":
    sys.stdout.write("x" * 300000)
elif action == "stderr":
    sys.stderr.write("x" * 300000)
elif action == "fork":
    child = os.fork()
    if child == 0:
        time.sleep(30)
        os._exit(0)
    Path(command["pidFile"]).write_text(str(child))
    if command.get("exitParent"):
        print("done", flush=True)
    else:
        time.sleep(30)
else:
    raise ValueError("unknown-probe")

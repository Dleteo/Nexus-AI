"""Read-only P1 inventory, not a sandbox runner or isolation attestation.

Does not start programs, contact a daemon, read credentials, or execute a task.
Exit 2 means execution remains blocked. See docs/FACTORY_SANDBOX_P1.md.
"""

import argparse
import json
import os
import platform
import shutil
from pathlib import Path


REQUIRED_VERIFICATIONS = (
    "rootless_runtime",
    "network_denial",
    "credential_absence",
    "readonly_filesystem_and_mounts",
    "cpu_memory_pid_disk_limits",
    "wall_timeout_and_tree_cancellation",
    "bounded_logs",
    "archive_and_workspace_validation",
)


def inventory():
    """Only discover local metadata; finding an executable proves no isolation."""
    system = platform.system()
    return {
        "platform": system,
        "uid": os.getuid() if hasattr(os, "getuid") else None,
        "commands_present": {
            name: shutil.which(name) is not None
            for name in ("podman", "docker", "runc", "bwrap", "newuidmap", "newgidmap")
        },
        "cgroup_v2_present": system == "Linux"
        and Path("/sys/fs/cgroup/cgroup.controllers").is_file(),
    }


def report(observations):
    """Remain closed even when all command names happen to be installed."""
    return {
        "schema_version": 1,
        "execution": {
            "enabled": False,
            "status": "not_run",
            "reason": "isolation_not_verified",
        },
        "observations": observations,
        "platform_candidate": observations.get("platform") == "Linux",
        "verification": {name: "unverified" for name in REQUIRED_VERIFICATIONS},
        "note": "Inventory only. No task or adversarial isolation test was executed.",
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args(argv)  # No flag or environment variable enables execution.
    print(json.dumps(report(inventory()), indent=2, sort_keys=True))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())

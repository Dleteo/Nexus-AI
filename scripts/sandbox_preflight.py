"""Read-only P1 inventory, not a sandbox runner or isolation attestation.

Does not start programs, contact a daemon, read credentials, or execute a task.
Exit 2 means execution remains blocked. See docs/FACTORY_SANDBOX_P1.md.
"""

import argparse
import json
import os
import platform
import re
import shutil
import stat
from pathlib import Path, PurePosixPath


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

METADATA_LIMIT = 4096


def _read_metadata(path):
    """Read only a bounded kernel metadata file; absence/errors stay unknown."""
    try:
        with path.open("rb") as source:
            raw = source.read(METADATA_LIMIT + 1)
        if len(raw) > METADATA_LIMIT:
            return None
        return raw.decode("ascii").strip()
    except (OSError, UnicodeError, ValueError):
        return None


def _uid_mapping(raw):
    if not raw:
        return None
    lines = raw.splitlines()
    if len(lines) > 32:
        return None
    mapping = []
    for line in lines:
        fields = line.split()
        if len(fields) != 3 or any(not value.isdecimal() for value in fields):
            return None
        inside, outside, length = map(int, fields)
        if not 0 < length <= 2**32 or max(inside, outside) + length > 2**32:
            return None
        mapping.append({"inside": inside, "outside": outside, "length": length})
    return mapping


def _controller_names(raw):
    if raw is None:
        return None
    names = raw.split()
    if len(names) > 32 or any(not re.fullmatch(r"[a-z][a-z0-9_]{0,31}", name) for name in names):
        return None
    return sorted(set(names))


def _cgroup_directory(raw):
    """Use only the current v2 membership; never publish or accept arbitrary paths."""
    if raw is None:
        return None, None
    memberships = [line[3:] for line in raw.splitlines() if line.startswith("0::")]
    if not memberships:
        return False, None
    if len(memberships) != 1:
        return None, None
    member = memberships[0]
    parts = member.split("/")
    if not member.startswith("/") or len(member) > 1024 or "\\" in member or \
            any(ord(char) < 32 or ord(char) == 127 for char in member) or \
            any(part in (".", "..") for part in parts) or \
            (member != "/" and any(not part for part in parts[1:])):
        return None, None
    return True, Path("/sys/fs/cgroup").joinpath(*PurePosixPath(member).parts[1:])


def _path_writable(path):
    if path is None:
        return None
    try:
        if not path.exists():
            return None
        return os.access(path, os.W_OK)
    except OSError:
        return None


def _socket_present(path):
    """Presence only at the conventional local path; never contact a daemon."""
    try:
        return stat.S_ISSOCK(path.lstat().st_mode)
    except FileNotFoundError:
        return False
    except OSError:
        return None


def _file_present(path):
    try:
        return path.is_file()
    except OSError:
        return None


def _linux_metadata(uid):
    membership, directory = _cgroup_directory(_read_metadata(Path("/proc/self/cgroup")))
    controllers = _read_metadata(directory / "cgroup.controllers") if directory is not None else None
    subtree = _read_metadata(directory / "cgroup.subtree_control") if directory is not None else None
    return {
        "scope": "metadata_only_not_isolation_evidence",
        "uid_mapping": _uid_mapping(_read_metadata(Path("/proc/self/uid_map"))),
        "cgroup_v2_membership": membership,
        "cgroup_controllers": _controller_names(controllers),
        "cgroup_subtree_control": _controller_names(subtree),
        "cgroup_directory_writable": _path_writable(directory),
        "cgroup_subtree_control_writable": _path_writable(directory / "cgroup.subtree_control")
        if directory is not None else None,
        "conventional_rootless_socket_present": _socket_present(Path(f"/run/user/{uid}/docker.sock"))
        if type(uid) is int and uid >= 0 else None,
    }


def inventory():
    """Only discover local metadata; finding an executable proves no isolation."""
    system = platform.system()
    uid = os.getuid() if hasattr(os, "getuid") else None
    return {
        "platform": system,
        "uid": uid,
        "commands_present": {
            name: shutil.which(name) is not None
            for name in ("podman", "docker", "runc", "bwrap", "newuidmap", "newgidmap")
        },
        "cgroup_v2_present": system == "Linux"
        and _file_present(Path("/sys/fs/cgroup/cgroup.controllers")),
        "linux_metadata": _linux_metadata(uid) if system == "Linux" else {"scope": "not_applicable"},
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

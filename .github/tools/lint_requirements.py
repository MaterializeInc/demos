#!/usr/bin/env python3

"""Sync .pre-commit-config.yaml dependencies with requirements.txt.

The requirements file is necessary for running `pip install` outside of
`pre-commit` hooks, like in CI jobs that run the other tools in this directory.
`pre-commit` makes this rather annoying [0].

[0]: https://github.com/pre-commit/pre-commit/issues/945
"""

import sys
from pathlib import Path
from typing import List, cast

from ruamel.yaml import YAML

PRECOMMIT_CONFIG_PATH = Path(".pre-commit-config.yaml")
REQUIREMENTS_TXT_PATH = Path(".github/tools/requirements.txt")
KNOWN_PYTHON_HOOKS = ["mypy"]


def main() -> int:
    with PRECOMMIT_CONFIG_PATH.open() as f:
        config = YAML().load(f)

    dependencies = None

    for repo in config["repos"]:
        for hook in repo["hooks"]:
            if hook.get("language") == "python" or hook["id"] == KNOWN_PYTHON_HOOKS:
                if dependencies is None:
                    dependencies = cast(List[str], hook["additional_dependencies"])
                elif (
                    "additional_dependencies" in hook
                    and hook["additional_dependencies"] != dependencies
                ):
                    print(
                        "lint: error: .pre-commit-config.yaml python hooks have disagreeing additional_dependencies",
                        file=sys.stderr,
                    )
                    return 1

    if not dependencies:
        print(
            "lint: error: .pre-commit-config is missing any hooks with python dependencies",
            file=sys.stderr,
        )
        return 1

    requirements_txt = "\n".join(dependencies) + "\n"

    if REQUIREMENTS_TXT_PATH.read_text() != requirements_txt:
        print(
            "lint: error: requirements.txt does not match dependencies in .pre-commit-config.yaml",
            file=sys.stderr,
        )
        REQUIREMENTS_TXT_PATH.write_text(requirements_txt)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())

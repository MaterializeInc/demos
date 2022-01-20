"""Configuration shared by the tools in this directory."""

from pathlib import Path

WORKFLOW_PATH = Path(".github/workflows/main.yml")
IMAGES_PATH = Path(".github/tools/images.yml")
REQUIREMENTS_TXT_PATH = Path(".github/tools/requirements.txt")
PRECOMMIT_CONFIG_PATH = Path(".pre-commit-config.yaml")

#!/usr/bin/env python3

"""Check for known errors in Dockerfiles and compose.yamls."""

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple, Union

from colored import attr
from config import IMAGES_PATH, WORKFLOW_PATH
from dockerfile_parse import DockerfileParser
from ruamel.yaml import YAML
from ruamel.yaml.comments import LineCol


class Context:
    def __init__(self):
        self.errors = []

        with WORKFLOW_PATH.open() as f:
            workflow = YAML().load(f)
        self.tested_dirs = workflow["jobs"]["test"]["strategy"]["matrix"]["demo"]

        self.allowed_images = {}
        with IMAGES_PATH.open() as f:
            image_groups = YAML().load(f)
            for group in image_groups.values():
                for image in group.get("images", []):
                    self.allowed_images[image] = group["tag"]


Position = Union[Tuple[int, int], LineCol]


@dataclass
class LintError:
    message: str
    suggestion: str
    path: Path
    pos: Optional[Position] = None

    def __str__(self):
        out = f"{attr('bold')}{self.path}{attr('reset')}"
        if isinstance(self.pos, LineCol):
            out += f":{self.pos.line + 1}:{self.pos.col + 1}"
        elif isinstance(self.pos, tuple):
            out += f":{self.pos[0] + 1}:{self.pos[1] + 1}"
        out += f": {self.message}\nsuggestion: {self.suggestion}"
        return out


def lint_image(ctx: Context, spec: str, path: Path, pos: Position):
    if ":" in spec:
        image, tag = spec.split(":", maxsplit=1)
    else:
        image = spec
        tag = "latest"

    if image not in ctx.allowed_images:
        ctx.errors.append(
            LintError(
                f"unauthorized image {image!r}",
                f"use a different image or allow this image in {IMAGES_PATH}",
                path,
                pos,
            )
        )
    elif tag != ctx.allowed_images[image]:
        ctx.errors.append(
            LintError(
                f"unauthorized tag {tag!r} for image {image!r}",
                f"use the allowed tag {ctx.allowed_images[image]!r} or update the allowed tag in {IMAGES_PATH}",
                path,
                pos,
            )
        )


def lint_dockerfile(ctx: Context, path: Path):
    with path.open() as f:
        dockerfile = DockerfileParser(fileobj=f)
        for instr in dockerfile.structure:
            if instr["instruction"] == "FROM":
                lint_image(ctx, instr["value"], path, (int(instr["startline"]), 0))


def lint_composition(ctx: Context, path: Path):
    if path.name != "compose.yaml":
        ctx.errors.append(
            LintError("incorrect file name", "rename to compose.yaml", path)
        )

    with path.open() as f:
        composition = YAML().load(f)

    if "version" in composition:
        ctx.errors.append(
            LintError(
                "specifying a version is deprecated",
                'remove the "version" key',
                path,
                composition.lc.key("version"),
            )
        )

    for name, service in composition.get("services", []).items():
        if "build" in service and "init" not in service:
            ctx.errors.append(
                LintError(
                    f"locally-built service {name!r} does not enable init process",
                    "add `init: true` to the service definition",
                    path,
                    service.lc.key("build"),
                )
            )

        if "image" in service:
            lint_image(ctx, service["image"], path, service.lc.key("image"))

    # In some cases, a different version of the same demo might exist
    # as a sub-directory (e.g. ecommerce, ecommerce-redpanda). To deal
    # with it, check for both paths against the matrix.
    if (
        path.parents[1].name
        and (path.parents[1].name + "/" + path.parents[0].name) not in ctx.tested_dirs
    ):
        ctx.errors.append(
            LintError(
                f"demo {path.parents[1].name!r} is not tested by CI",
                f"add {path.parents[1].name!r} to the test step matrix",
                WORKFLOW_PATH,
                ctx.tested_dirs.lc,
            )
        )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="check for known errors in Dockerfiles and compose.yamls"
    )
    parser.add_argument("files", nargs="+", type=Path)
    args = parser.parse_args()

    ctx = Context()

    for file in args.files:
        if file.name == "Dockerfile":
            lint_dockerfile(ctx, file)
        else:
            lint_composition(ctx, file)

    for error in ctx.errors:
        print(error, file=sys.stderr)
        print(file=sys.stderr)

    return 1 if ctx.errors else 0


if __name__ == "__main__":
    sys.exit(main())

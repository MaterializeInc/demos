#!/usr/bin/env python3

"""Bump image versions across the repository."""

import argparse
import sys
from pathlib import Path

from config import IMAGES_PATH
from dockerfile_parse import DockerfileParser
from ruamel.yaml import YAML

yaml = YAML()
yaml.indent(mapping=2, sequence=4, offset=2)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="bump image versions across the repository"
    )
    parser.add_argument(
        "image_group",
        metavar="image-group",
        help="the ID of an image group in images.yaml",
    )
    parser.add_argument("version", help="the version to bump to")
    args = parser.parse_args()

    with IMAGES_PATH.open() as f:
        image_groups = yaml.load(f)
        if args.image_group not in image_groups:
            print(f"unknown image group {args.image_group!r}", file=sys.stderr)
            return 1
        image_groups[args.image_group]["tag"] = args.version
        targets = image_groups[args.image_group]["images"]
    with IMAGES_PATH.open("w") as f:
        yaml.dump(image_groups, f)

    def munge_image(spec: str):
        image = spec.split(":")[0]
        if image in targets:
            return f"{image}:{args.version}"
        return spec

    for path in Path(".").glob("**/*"):
        if path.name == "compose.yaml":
            with path.open() as f:
                composition = yaml.load(f)
                for service in composition.get("services", {}).values():
                    if "image" in service:
                        service["image"] = munge_image(service["image"])
            with path.open("w") as f:
                yaml.dump(composition, f)
        elif path.name == "Dockerfile":
            with path.open("rb+") as df:
                dockerfile = DockerfileParser(fileobj=df)
                dockerfile.parent_images = [
                    munge_image(img) for img in dockerfile.parent_images
                ]

    return 0


if __name__ == "__main__":
    sys.exit(main())

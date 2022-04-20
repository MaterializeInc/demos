# Contributing to Materialize demos

Thank you for your interest in Materialize demos! Contributions of many kinds
are encouraged and most welcome.

If you have questions, please [create a Github issue](https://github.com/MaterializeInc/demos/issues/new).

## Linting

The [`pre-commit`] tool runs in CI and automatically checks for a variety of
errors like misformatted files.

You can set up your local environment to automatically run `pre-commit`:

```shell
brew install pre-commit
pre-commit install
```

Now, whenever you type `git commit`, the `pre-commit` tool will inform you
whether you've violated any of the lint rules. In many cases, it will
automatically fix the errors and leave them in your working tree for your
review.

You can also run `pre-commit` on demand against all files in the repository:

```shell
pre-commit run --all-files
```

### Docker image constraints

We tightly control the Docker images that we allow in this repository. CI will
check that you only use images from the approved list. If necessary, you can add
a new image to the approved list or bump the approved tag for an existing image.
See [.github/tools/images.yml](.github/tools/images.yml) for details.

## Testing

Every demo with a `compose.yaml` must be accompanied by at least a simple smoke
test. Tests live in [.github/tests](./github/tests) in a file named
`DEMONAME.sh`. The test should run `docker-compose up -d` and interact with one
of the leaf services—usually Materialize, or a server that is downstream of
Materialize. The more extensive the test, the better, but even a simple test
will smoke out more problems than you think, e.g., a service failing to boot
because of a mistyped environment variable.

> :warning: **Make sure permissions are set correctly:** `chmod 755 DEMONAME.sh`

## Updating to the latest Materialize

To update all demos to a new version of Materialize, run:

```shell
.github/tools/bump.py materialize VERSION
```

[`pre-commit`]: https://pre-commit.com

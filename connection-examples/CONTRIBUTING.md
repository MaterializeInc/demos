# Contributing to Materialize Connection Examples

Thank you for your interest in Materialize connection examples!
Contributions of many kinds are encouraged and most welcome.

## Pull requests

We welcome pull requests from everyone.

Fork, then clone the repo:

```
git clone https://github.com/<username>/demos.git
```

Create a branch for your edits:

```
git checkout -b my-branch

cd connection-examples
```

### Contributing a new example

Run the init script to create the default secrets file:

```bash
bash scripts/init.sh
```

The script will prompt you for the following information:
- `Programming language`: The name of the programming language or framework
- `File extension`: The file extension for the language or framework

The script will create a new directory with the name of the language or framework
and add template files where you can add your code.

Once you have added your code, commit your changes and push to your fork:

```
git add .
git commit -m "Add my example"
git push origin my-branch
```

That's it — you're ready to submit a pull request!

## Getting support

If you run into a snag or need support as you prepare your contribution, join the Materialize [Slack community](https://materialize.com/s/chat) or [open an issue](https://github.com/MaterializeInc/connection-examples/issues/new)!

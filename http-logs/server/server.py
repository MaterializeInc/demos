#!/usr/bin/env python3

# Copyright Materialize, Inc. and contributors. All rights reserved.
#
# Use of this software is governed by the Business Source License
# included in the LICENSE file at the root of this repository.
#
# As of the Change Date specified in that file, in accordance with
# the Business Source License, use of this software will be governed
# by the Apache License, Version 2.0.

from flask import Flask

app = Flask(__name__)


@app.route("/")
def gateway():
    return "Gateway page!"


@app.route("/detail/<id>")
def detail(id):
    return "Product detail page for {}".format(id)


@app.route("/search/")
def search():
    return "fixme"


if __name__ == "__main__":
    app.run(host="0.0.0.0")

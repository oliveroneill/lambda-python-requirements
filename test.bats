#!/usr/bin/env bats


setup() {
    export SLS_DEBUG=t
    if ! [ -z "$CI" ]; then
        export LC_ALL=C.UTF-8
        export LANG=C.UTF-8
    fi
}

teardown() {
    rm -rf puck puck2 puck3 node_modules pal package.zip .requirements-cache
}

@test "py3.6 can package flask with default options" {
    cd tests/base
    npm i $(npm pack ../..)
    npm link
    node node_modules/pal/index.js --dockerizePip
    ls pal/flask
}

@test "py3.6 can package flask with zip option" {
    cd tests/base
    npm i $(npm pack ../..)
    npm link
    node node_modules/pal/index.js --zip --dockerizePip
    unzip package.zip -d puck
    ls puck/flask
}

@test "py3.6 doesn't package boto3 by default" {
    cd tests/base
    npm i $(npm pack ../..)
    npm link
    node node_modules/pal/index.js --dockerizePip
    ! ls pal/boto3
}

@test "pipenv py3.6 can package flask with default options" {
    cd tests/pipenv
    npm i $(npm pack ../..)
    npm link
    node node_modules/pal/index.js --usePipenv --dockerizePip
    ls pal/flask
}

@test "pipenv py3.6 can package flask with zip option" {
    cd tests/pipenv
    npm i $(npm pack ../..)
    npm link
    node node_modules/pal/index.js --zip --usePipenv --dockerizePip
    unzip package.zip -d puck
    ls puck/flask
}

@test "pipenv py3.6 doesn't package boto3 by default" {
    cd tests/pipenv
    npm i $(npm pack ../..)
    npm link
    node node_modules/pal/index.js --usePipenv --dockerizePip
    ! ls pal/boto3
}

@test "py3.6 cleans up pal directory with zip option" {
    cd tests/base
    npm i $(npm pack ../..)
    npm link
    node node_modules/pal/index.js --zip --dockerizePip
    ! ls pal/
}

@test "py3.6 can package handler with default options" {
    cd tests/base
    npm i $(npm pack ../..)
    npm link
    node node_modules/pal/index.js --dockerizePip
    ls pal/handler.py
}

@test "py3.6 can package handler with zip option" {
    cd tests/base
    npm i $(npm pack ../..)
    npm link
    node node_modules/pal/index.js --zip --dockerizePip
    unzip package.zip -d puck
    ls puck/handler.py
}

@test "pipenv py3.6 can package handler with zip option" {
    cd tests/pipenv
    npm i $(npm pack ../..)
    npm link
    node node_modules/pal/index.js --zip --usePipenv --dockerizePip
    unzip package.zip -d puck
    ls puck/handler.py
}

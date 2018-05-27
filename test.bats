#!/usr/bin/env bats


setup() {
    export SLS_DEBUG=t
    if ! [ -z "$CI" ]; then
        export LC_ALL=C.UTF-8
        export LANG=C.UTF-8
    fi
    npm link
}

teardown() {
    rm -rf puck puck2 puck3 node_modules pal package.zip .requirements-cache
}

@test "py3.6 can package flask with default options" {
    cd tests/base
    pal --dockerizePip
    ls pal/flask
}

@test "py3.6 can package flask with zip option" {
    cd tests/base
    pal --zip --dockerizePip
    unzip package.zip -d puck
    ls puck/flask
}

@test "py3.6 doesn't package boto3 by default" {
    cd tests/base
    pal --dockerizePip
    ! ls pal/boto3
}

@test "pipenv py3.6 can package flask with default options" {
    cd tests/pipenv
    pal --usePipenv --dockerizePip
    ls pal/flask
}

@test "pipenv py3.6 can package flask with zip option" {
    cd tests/pipenv
    pal --zip --usePipenv --dockerizePip
    unzip package.zip -d puck
    ls puck/flask
}

@test "pipenv py3.6 doesn't package boto3 by default" {
    cd tests/pipenv
    pal --usePipenv --dockerizePip
    ! ls pal/boto3
}

@test "py3.6 cleans up pal directory with zip option" {
    cd tests/base
    pal --zip --dockerizePip
    ! ls pal/
}

@test "py3.6 can package handler with default options" {
    cd tests/base
    pal --dockerizePip
    ls pal/handler.py
}

@test "py3.6 can package handler with zip option" {
    cd tests/base
    pal --zip --dockerizePip
    unzip package.zip -d puck
    ls puck/handler.py
}

@test "pipenv py3.6 can package handler with zip option" {
    cd tests/pipenv
    pal --zip --usePipenv --dockerizePip
    unzip package.zip -d puck
    ls puck/handler.py
}

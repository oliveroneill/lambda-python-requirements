#!/usr/bin/env bats


setup() {
    export SLS_DEBUG=t
    if ! [ -z "$CI" ]; then
        export LC_ALL=C.UTF-8
        export LANG=C.UTF-8
    fi
}

teardown() {
    rm -rf puck puck2 puck3 node_modules lambda requirements.zip .requirements-cache
    if [ -f serverless.yml.bak ]; then mv serverless.yml.bak serverless.yml; fi
}

@test "py3.6 can package flask with default options" {
    cd tests/base
    npm i $(npm pack ../..)
    npm link
    lambda-python-requirements --dockerizePip
    ls lambda/requirements/flask
}

@test "py3.6 can package flask with zip option" {
    cd tests/base
    npm i $(npm pack ../..)
    npm link
    lambda-python-requirements --zip --dockerizePip
    unzip requirements.zip -d puck
    ls requirements.zip
    ls puck/flask
}

@test "py3.6 doesn't package boto3 by default" {
    cd tests/base
    npm i $(npm pack ../..)
    npm link
    lambda-python-requirements --dockerizePip
    ! ls lambda/requirements/boto3
}

@test "pipenv py3.6 can package flask with default options" {
    cd tests/pipenv
    npm i $(npm pack ../..)
    lambda-python-requirements --usePipenv --dockerizePip
    ls lambda/requirements/flask
}

@test "pipenv py3.6 can package flask with zip option" {
    cd tests/pipenv
    npm i $(npm pack ../..)
    lambda-python-requirements --zip --usePipenv --dockerizePip
    unzip requirements.zip -d puck
    ls requirements.zip
}

@test "pipenv py3.6 doesn't package boto3 by default" {
    cd tests/pipenv
    npm i $(npm pack ../..)
    lambda-python-requirements --usePipenv --dockerizePip
    ! ls lambda/requirements/boto3
}

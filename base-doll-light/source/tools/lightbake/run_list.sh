#!/bin/bash
for c in "$@"; do ./run_one.sh $c || echo "$c FAILED"; done

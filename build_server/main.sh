#!/bin/bash

export GIT_REPOSITORY__URL="$GIT_REPOSITORY__URL"

gi clone "$GIT_REPOSITORY__URL" /home/app/output

exec node script.js

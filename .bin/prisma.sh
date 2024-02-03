#!/bin/bash

echo "$@"
npx prisma format "$@"

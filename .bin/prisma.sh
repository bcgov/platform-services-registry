#!/bin/bash

cd app && npx prisma format && npx prisma generate "$@"

# Running Locally

How to run the app locally:

1. Complete the steps in:
    1. [Local Development Environment](./local-development-environment.md)
    1. [Sandbox Environment](./sandbox.md)
1. Ensure the sandbox environment is running
1. `make install`
1. Login to the Openshift project `101ed4-prod` on the CLI
1. `make copy-db`
1. `make dev`

## Troubleshooting

### Canvas error

**Problem**

The `make install` command gives the error:

```
cd app/node_modules/.pnpm/canvas@3.2.0/node_modules/canvas &&\
 pnpm add -D node-gyp &&\
 pnpm exec node-gyp rebuild
bash: line 0: cd: app/node_modules/.pnpm/canvas@3.2.0/node_modules/canvas: No such file or directory
make: *** [canvas-install] Error 1
```

**Solution**

1. Comment out the `install: canvas-install` section in the [Makefile](https://github.com/bcgov/platform-services-registry/blob/f2edf53d94ca4ab79fd1bed193def57c8411e434/Makefile)
1. `make install`
1. Uncomment the `install: canvas-install` section
1. `make install`

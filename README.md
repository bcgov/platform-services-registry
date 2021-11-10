 ![Test & Build](https://github.com/bcgov/platform-services-registry/workflows/Test%20&%20Build/badge.svg) [![img](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

# Platform Services Registry

The Platform Services' Project Registry is a single entry point for the Platform Service intake process. It is where teams can submit requests for provisioning namespaces in OpenShift 4 (OCP4) clusters, as well as perform other tasks such as:
* Update project contact details and other metadata;
* Request their project namespace set be created additional clusters;
* Request other resources be provisioned such as KeyCloak realms or Artifactory pull-through repositories.

## TL;DR

This repo contains all the components for the Platform Service Registry as well as all the OpenShift 4.x manifests to build and deploy said project. You can find more about each component here:
* [Web](./web/README.md);
* [API](./api/README.md); and
* [Database](./db/README.md)

## Project Structure

Find anything relevant to the project as a whole in the repo root such as OCP4 manifests; docker compose file; and development configuration. Each of the three main components to the project are listed below and have their own build and deployment documentation:

* [Web](./web/README.md);
* [API](./api/README.md); and
* [Database](./db/README.md)

## Architecture

The registry is a typical web app with an API backed by persistent storage. This serves to provide an interface for humans and automations alike, and, persist the data in a reliable way. Beyond this, the registry utilizes [NATS](https://nats.io/) to send message to "smart robots" that perform tasks outside of its scope.

These smart robots include:

| Name                   | Repo | Description | 
| :--------------------- | :--- | :-----------|
| Namespace Provisioning | [here](https://github.com/bcgov-c/devops-fulfillment-pipeline) |This automation implements a GitOps approach to provisioning a namespace set with quotas and various service accounts on our clusters | 

## How to Build & Deploy

There are lots of moving parts in the registry even though its a relatively simple web app. Each section below will walk you through the parameters and commands needed to deploy.

**ProTip** 🤓

All components should have the same label that can be used to remove them. This is useful in dev and test so that multiple deployments can be tested from a clean working namespace:

```console
oc delete all,nsp,en,pvc,sa,secret,role,rolebinding \
  -l "app=platsrv-registry"
```

### Role Based Access Control (RBAC)

Assuming you are building both the Patroni and Backup images in an OCP `tools` namespace, you will need some RBAC to pull said images from tools to your other namespaces for deployment. Read, then run, the RBAC manifest located [here](./openshift/rbac.yaml). It will enough access for the image puller to do its job.

```console
oc apply -f openshift/rbac.yaml
```

### Network Security Policy(ies)

As of OCP4 Network Service Policy (NSP) is required to allow all the components (Web, API, DB, and SSO) to communicate. In each of the Web, API and DB deployment manifests there will be a label to uniquely identify each component by `roll`; for the Patroni database there will be a unique characteristic to identify any pod that is part of the cluster. These are used in the NSP to enable communication.

In the `tools` namespace run this NSP to allow the build to pull resources form the internet:

```console
oc process -f openshift/templates/nsp-tools.yaml \
  -p NAMESPACE=$(oc project --short) | \
  oc apply -f -
```

Then, in each of the other namespaces run the application specific NSP. It will allow each component to talk to one another as necessary. To accommodate the different configuration of NATS in dev and test vs prod some parameters are required by the OCP template:

```console
oc process -f openshift/templates/nsp.yaml \
  -p NAMESPACE=$(oc project --short) \
  -p NATS_NAMESPACE=$(oc project --short) \
  -p NATS_APO_IDENTIFIER="app=nats"| \
  oc apply -f -
```

| Name                   | Description | 
| :--------------------- | :-----------|
| NAMESPACE              | The namespace where the NSP is being deployed. |
| NATS_NAMESPACE         | The namespace where NATS exists. |
| NATS_APO_IDENTIFIER    | The unique identifier used for NATS. |

### Database

The build and deploy documents for PostgreSQL (Patroni) are located in the [db](./db) directory of this project.

### Database Backup Container (Prod Only)

The community supported backup container is used to backup the database. Setup the database container using the helm charts:

```console
helm repo add bcgov https://bcgov.github.io/helm-charts

helm install db-backup bcgov/backup-storage -f ./openshift/backup/deploy-values.yaml
```

### API

The build and deploy documents for the API are located in the [api](./api) directory of this project.

### Web

The build and deploy documents for the Web are located in the [web](./web) directory of this project.

### NATS (Dev & Test Only)

The API needs to connect to [NATS](https://nats.io) for messaging the "smart robots". In production a shared NATS exists, however, in dev and test there no such thing. Fire up a stand alone NATS instance to accept message from the API.

Deploy a stand alone, single Pod instance of NATS with the DeploymentConfig provided. Provide its service to the API when deployed so it can find and use this service.

```console
oc process -f openshift/templates/nats.yaml
```

## Project Status / Goals / Roadmap

Additional features and fixes can be found in backlog; find it under issues in this repo.

## Getting Help or Reporting an Issue

If you find issues with this application suite please create an [issue](https://github.com/bcgov/secure-image-app/issues) describing the problem in detail.

## How to Contribute

Contributions are welcome. Please ensure they relate to an issue. See our 
[Code of Conduct](./CODE-OF-CONDUCT.md) that is included with this repo for important details on contributing to Government of British Columbia projects. 
#### How to setup Local development
We suggest run this in docker container, you can download docker [here](https://www.docker.com/get-started).

This application has a function that will invite GitHub users to specified git organization, to make it locally, you will need to create your own test GitHub organization and Git App.

**Step 1**
Create a/two Git Organization(s) [here](https://github.com/account/organizations/new?coupon=&plan=team_free) or you can use any exiting orgnization that you have full access.

**Step 2**
* In organization setting => Developer settings => GitHub Apps create a new GitHub app.
* Give your app a meaningful name, and description.
* Homepage URL can be anything, I recommend we can fill in with `http://localhost:8100/api`. 
* Make sure **Expire user authorization tokens**, **Request user authorization (OAuth) during installation** and **Webhook:Active** boxes are unchecked.
* In your apps permissions configuration, ensure to add read/write to membership.
* You can allow Any account to installed this GitHub App.

**Step 3**
* Create and save a client secret, this will be needed as env variable
* Create and save the github app private key(.pem file), this will be needed to deploy the server
* Install the application on your desired github organizations

**Step 4**
* In `api/src/config` copy `config.json.example` to create `config.json` and update **orgs** and **primaryOrg** to the orgnization name that you have your GitHub App installed on. 

* copy the private key from GitHub App you just downloaded to `api/src/config` and rename it to `github-private-key.pem`

**Step 5**
* Copy `.env.example` to create `.env`.
* You can find `Client ID` and `App ID` in GitHub App page, copy those value to  `GITHUB_CLIENT_ID` and `GITHUB_APP_ID`. 
* Copy the client secret that you saved in Step 3 to `GITHUB_CLIENT_SECRET`
* Fill `GITHUB_ORGANIZATION` with orgnization name that you have your GitHub App installed on.

**Last Step**
* In application root directory: run `mkdir pg_data`
* In ***/api*** directory run 
```
npm install
npm run build
```
* In ***/web*** directory run 

```
npm install
```
Now you are ready to go back to application root directory and run `docker-compose up -d`

After Docker Container finish creating, you can vist you local build at: http://localhost:8101/public-landing

## License

See the included [LICENSE](./LICENSE) file.

# Onboarding and Offboarding Documentation

This document outlines the necessary steps for onboarding and offboarding developers for our application. It includes role assignments, access requirements, and communication channels to ensure a smooth transition.

---

## 1. Role Assignments

-**Live OCP consoles**

-**Dev, Test, Prod Live Environments**

-**Dev, Test, Prod Live Keycloak realms**

---

## 2. Access Requirements

-**GitHub Repository Access**

-**Zenhub Board**

-**Uptime Access**

-**Platform Services Google Drive Access**

---

## 3. Communication Channels

### Internal Rocket.Chat Channels

- **#app-dev-team**
- **#app-dev-internal**:
- **#internal-platform-services**
- **#internal-devops-registry**
- **#internal-provisioner**

### External Rocket.Chat Channels

- **#devops-operations**
- **#devops-how-to**
- **#devops-alerts**
- **#devops-sos**
- **#devops-registry**
- **#labops-alerts**
- **#labops-requests**
- **#rocky-chat**
- **#random**
- **#general**
- **#rocketchat-help**
- **#kudos**
- **#github-news-and-support**

### Microsoft Teams Channels

- **External: DOCS Branch**
- **External: Digital Office**

---

## 4. Offboarding Process

### Revoking Access

1. **Live OCP consoles**:
   - Remove the developer's access to the openshift console namespaces.
2. **GitHub Repository**:
   - Remove the developer’s GitHub username from the repo admin list.
3. **Uptime Monitoring**:
   - Revoke login credentials.
4. **Google Drive**:
   - Remove access to shared folders.

### Updating Roles

- **Keycloak**:
  - Remove roles for Dev, Test, and Prod environments.
  - Remove realm roles for Dev, Test, and Prod.

### Communication Channels

- **Rocket.Chat**:
  - Remove the developer from all internal channels.
- **Teams**:
  - Remove from External DOCS Branch and Digital Office channels.

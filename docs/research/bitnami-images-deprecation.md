# Bitnami Images Deprecation – Migration Analysis

## 1. Introduction

On **August 28th, 2025**, Bitnami will **deprecate the majority of its container images** from the main public repository (`docker.io/bitnami`).

-   Only a **limited subset** of _latest_-tag hardened images will remain available for free in the **Bitnami Secure** namespace.
-   All other images will be moved to the **Bitnami Legacy** repository (`docker.io/bitnamilegacy`) — which will **receive no further updates, security patches, or bug fixes**.
-   Version-pinned tags (e.g., `mongodb:8.0.13`) will no longer be available in the free tier.
-   Bitnami Helm charts will remain published but will **fail if they reference removed images**, unless updated.

**Impact:**
If you are using Bitnami images or Bitnami Helm charts in production, **your deployments will break** when they attempt to pull images that no longer exist. This will cause:

-   `ImagePullBackOff` / `ErrImagePull` errors in Kubernetes
-   CI/CD pipeline failures
-   Service downtime during restarts or scaling

## 2. Migration Options

### Option 1 – Point Helm Charts to Legacy Repository

**Example:** `bitnamilegacy/mongodb`

**Pros:**

-   Minimal changes needed — only update the repository path in `values.yaml`
-   Keeps current version running without chart rewrites

**Cons:**

-   **No security updates** (risk of vulnerabilities over time)
-   **No bug fixes** for critical issues
-   **Unknown lifespan** — Bitnami may remove `bitnamilegacy` in the future
-   **Version drift** — teams could end up on incompatible versions

### Option 2 – Subscribe to Bitnami Secure Images

**Example:** `bitnamisecure/mongodb:<version>` _(requires paid subscription)_

**Pros:**

-   Access to **all versions**, **LTS branches**, and **security updates**
-   Enterprise-grade support, hardened builds, SBOMs, CVE transparency

**Cons:**

-   **High cost** ($50,000–$72,000/year)
-   Vendor lock-in

### Option 3 – Use Public “Latest” from Bitnami Secure

**Example:** `bitnamisecure/mongodb:latest` _(free, development use only)_

**Pros:**

-   No subscription cost
-   Automatically receives updates for the latest stable release

**Cons:**

-   **No version pinning** — deployments may break due to unexpected major updates
-   **Not production-safe** — could introduce instability if “latest” contains breaking changes

### Option 4 – Replace Bitnami Images with Official Vendor Images

**Example:** Use official MongoDB Helm chart with `mongodb:8.0.13`

**Pros:**

-   Maintained directly by the upstream vendor (MongoDB, PostgreSQL, Redis, etc.)
-   No dependency on Bitnami’s business model

**Cons:**

-   Requires creating or adapting **custom Helm charts**
-   Ongoing maintenance burden for chart updates and compatibility

### Option 5 – Build and Maintain Your Own Images

**Example:**

-   Use Bitnami’s open-source Dockerfiles from GitHub (`bitnami/containers`)
-   Automate builds via GitHub Actions to produce private images regularly

**Pros:**

-   Full control over **versioning** and **security patching**
-   Can pin specific versions in Helm charts
-   Avoids Bitnami subscription fees

**Cons:**

-   Requires setting up and maintaining a CI/CD pipeline for builds
-   Responsibility for security scanning, updates, and hosting

## 3. Recommendation

**Short-term (Immediate Fix):**
Migrate production workloads to `bitnamilegacy` to prevent downtime **before August 28th, 2025**.
This avoids immediate breakage but should be treated as a **temporary solution only**.

**Long-term (Strategic Fix):**
**Option #5** — Build and maintain your own images — is the most sustainable and cost-effective path without paying for Bitnami Secure.

-   Preserves version pinning
-   Eliminates vendor dependency
-   Can be automated with daily/weekly builds for security updates

**Why not Option #4?**
While official vendor images are reliable, migrating Helm charts for multiple services is more time-consuming than keeping Bitnami’s Helm charts but replacing the image source.

## 4. Migration Checklist

1. **Inventory all Bitnami usage**
    ```bash
    kubectl get pods -o jsonpath='{.items[*].spec.containers[*].image}' | grep bitnami
    ```
2. **Update `values.yaml`** to point to `bitnamilegacy` (short term)
3. **Set up GitHub Actions** to build images from the latest Bitnami's secure image
    ```dockerfile
    FROM docker.io/bitnamisecure/mongodb:latest
    ```
4. **Publish built images** in GitHub Packages as the repo is public
5. **Update `values.yaml`** to point to the custom images deployed in GitHub Packages

## 5. Conclusion

The Bitnami image deprecation is a **critical supply chain risk** for Kubernetes environments.
While pointing to `bitnamilegacy` can buy time, it is **not a safe long-term solution**.

By automating builds of Bitnami’s open-source images (Option #5), you:

-   Retain control over versions
-   Ensure security patches are applied
-   Avoid costly licensing fees
-   Reduce dependency on third-party registries

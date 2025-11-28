#!/usr/bin/env bash
# pragma: allowlist secret
set -euo pipefail

SRC_IMAGE="docker.io/bitnami/postgresql:latest"
echo "Pulling $SRC_IMAGE"

if ! docker pull "$SRC_IMAGE"; then
    echo "::error::Failed to pull $SRC_IMAGE. Bitnami may have removed or restricted this image."
    exit 1
fi

FULL_REF="$(docker inspect --format='{{index .RepoDigests 0}}' "$SRC_IMAGE" || true)"

if [[ -z ${FULL_REF} ]]; then
    echo "::error::Unable to read RepoDigests for $SRC_IMAGE. Cannot resolve a fixed digest."
    exit 1
fi

REF_HASH="${FULL_REF#*@}"

if [[ -z ${REF_HASH} ]]; then
    echo "::error::Resolved hash is empty for $SRC_IMAGE. RepoDigests: ${FULL_REF}"
    exit 1
fi

cat <<EOF >>"$GITHUB_ENV" # pragma: allowlist secret
POSTGRES_IMAGE_REGISTRY=docker.io
POSTGRES_IMAGE_REPOSITORY=bitnami/postgresql
POSTGRES_IMAGE_DIGEST=${REF_HASH}
EOF

echo "Resolved PostgreSQL image reference: $FULL_REF"

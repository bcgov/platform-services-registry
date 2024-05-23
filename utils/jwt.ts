import axios from 'axios';
import jwt, { VerifyOptions } from 'jsonwebtoken';
import jwkToPem, { JWK } from 'jwk-to-pem';
import jws from 'jws';
import _isPlainObject from 'lodash-es/isPlainObject';
import { logger } from '@/core/logging';

const authHeaderPrefix = 'Bearer';
const jwksCache: {
  [url: string]: {
    keys: {
      // See https://datatracker.ietf.org/doc/html/rfc7517#section-4
      kid: string;
      kty: string;
      alg: string;
      use: string;
      n: string;
      e: string;
      x5c: string[];
      x5t: string;
      'x5t#S256': string;
    }[];
  };
} = {};

interface VerifyJwtTokenArgs {
  jwksUri: string;
  jwtToken: string;
  issuer?: string;
  audience?: string;
  authorizedPresenter?: string;
  requiredClaims?: string[];
}

/**
 * Verifies a JWT token using the provided parameters.
 *
 * @param {VerifyJwtTokenArgs} param0 - Object containing parameters for JWT verification.
 * @returns {Promise<object>} - Promise resolving to the decoded JWT payload.
 * @throws {Error} - Throws an error if the JWT token is invalid or verification fails.
 */
export async function verifyJwtToken({
  jwksUri,
  jwtToken,
  issuer,
  audience,
  authorizedPresenter,
  requiredClaims,
}: VerifyJwtTokenArgs) {
  // Check if JWT token is provided
  if (!jwtToken) {
    throw Error('invalid jwt token');
  }

  // Trim authorization header prefix if present
  if (jwtToken.startsWith(authHeaderPrefix)) jwtToken = jwtToken.slice(authHeaderPrefix.length).trim();

  // Decode JWT token header
  const decodedToken = jws.decode(jwtToken);

  if (decodedToken !== null) {
    const { header } = decodedToken;

    // Fetch JWKS from cache or URL if not cached
    if (!jwksCache[jwksUri]) {
      jwksCache[jwksUri] = await axios.get(jwksUri).then((res) => res.data);
    }

    // Extract keys from JWKS
    const { keys } = jwksCache[jwksUri];

    // Find key matching the token's key ID
    const key = keys.find((k) => k.kid === header.kid);

    // Throw error if key is not found
    if (!key) {
      throw Error('jwk key does not found.');
    }

    // Convert JWK to PEM format for verification
    const pem = jwkToPem(key as JWK);

    // Verification options
    const verifyOptions: VerifyOptions = {
      maxAge: '8h',
      ignoreExpiration: true,
    };

    // Set issuer if provided
    if (issuer) {
      verifyOptions.issuer = issuer;
    }

    // Set audience if provided
    if (audience) {
      verifyOptions.audience = audience;
    }

    // Verify JWT token
    const jwtPayload = jwt.verify(jwtToken, pem, verifyOptions);

    // Manual inspection for authorized presenter if specified
    if (authorizedPresenter && (jwtPayload as { azp: string }).azp !== authorizedPresenter) {
      throw Error('authorized presenter does not match');
    }

    if (requiredClaims && requiredClaims.length > 0) {
      if (!_isPlainObject(jwtPayload)) {
        throw Error('invalid JWT claims format: expected an object');
      }

      if (!requiredClaims.every((claim: string) => !!(jwtPayload as Record<string, any>)[claim])) {
        throw Error('required claims are missing');
      }
    }

    // Return decoded JWT payload
    return jwtPayload;
  }
  return null;
}

export async function verifyKeycloakJwtTokenSafe({
  authUrl,
  realm,
  jwtToken,
  audience,
  authorizedPresenter,
  requiredClaims,
}: Omit<VerifyJwtTokenArgs, 'jwksUri' | 'issuer'> & { authUrl: string; realm: string }) {
  try {
    const issuer = `${authUrl}/realms/${realm}`;
    const jwksUri = `${issuer}/protocol/openid-connect/certs`;
    const result = await verifyJwtToken({ jwtToken, issuer, jwksUri, audience, authorizedPresenter, requiredClaims });
    return result;
  } catch (error) {
    logger.error('verifyKeycloakJwtTokenSafe:', error);
    return null;
  }
}

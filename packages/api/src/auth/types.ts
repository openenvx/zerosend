export type PrincipalKind = 'admin' | 'api_key' | 'external';
export type ApiKeyType = 'test' | 'live';

export interface AdminPrincipal {
  kind: 'admin';
  id: string;
  scopes: string[];
}

export interface ApiKeyPrincipal {
  kind: 'api_key';
  id: string;
  scopes: string[];
  keyType: ApiKeyType;
  keyPrefix: string;
}

export interface ExternalPrincipal {
  kind: 'external';
  id: string;
  scopes: string[];
}

export type Principal = AdminPrincipal | ApiKeyPrincipal | ExternalPrincipal;

export function parseKeyType(value: string): ApiKeyType | null {
  if (value === 'test' || value === 'live') {
    return value;
  }

  return null;
}

export interface AuthAdapter {
  authenticate(request: Request): Promise<Principal | null>;
}

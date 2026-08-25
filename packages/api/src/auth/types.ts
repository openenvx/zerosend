export type PrincipalKind = "admin" | "api_key" | "external";

export interface Principal {
  kind: PrincipalKind;
  id: string;
  scopes: string[];
}

export interface AuthAdapter {
  authenticate(request: Request): Promise<Principal | null>;
}

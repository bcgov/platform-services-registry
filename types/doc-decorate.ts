export interface PrivateCloudProjectDecorate {
  _permissions: { view: boolean; edit: boolean; delete: boolean; reprovision: boolean; resend: boolean };
}

export interface PrivateCloudRequestDecorate {
  _permissions: { view: boolean; edit: boolean; review: boolean; delete: boolean };
}

export interface PublicCloudProjectDecorate {
  _permissions: { view: boolean; edit: boolean; delete: boolean };
}

export interface PublicCloudRequestDecorate {
  _permissions: { view: boolean; edit: boolean; review: boolean; delete: boolean };
}

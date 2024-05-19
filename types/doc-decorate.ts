export interface PrivateCloudProjectDecorate {
  _permissions: {
    view: boolean;
    viewHistory: boolean;
    edit: boolean;
    delete: boolean;
    reprovision: boolean;
  };
}

export interface PrivateCloudRequestDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    review: boolean;
    delete: boolean;
    resend: boolean;
    viewProduct: boolean;
  };
}

export interface PublicCloudProjectDecorate {
  _permissions: { view: boolean; viewHistory: boolean; edit: boolean; delete: boolean; reprovision: boolean };
}

export interface PublicCloudRequestDecorate {
  _permissions: { view: boolean; edit: boolean; review: boolean; delete: boolean; viewProduct: boolean };
}

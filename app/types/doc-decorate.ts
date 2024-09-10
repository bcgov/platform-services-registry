export interface PrivateCloudProjectDecorate {
  _permissions: {
    view: boolean;
    viewHistory: boolean;
    edit: boolean;
    delete: boolean;
    reprovision: boolean;
    toggleTemporary: boolean;
  };
}

export interface PrivateCloudRequestDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    review: boolean;
    delete: boolean;
    resend: boolean;
    viewDecision: boolean;
    viewProduct: boolean;
  };
}

export interface PublicCloudProjectDecorate {
  _permissions: {
    view: boolean;
    viewHistory: boolean;
    edit: boolean;
    delete: boolean;
    reprovision: boolean;
    signMou: boolean;
    reviewMou: boolean;
  };
}

export interface PublicCloudRequestDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    review: boolean;
    signMou: boolean;
    reviewMou: boolean;
    delete: boolean;
    viewProduct: boolean;
  };
}

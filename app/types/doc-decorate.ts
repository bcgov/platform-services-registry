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

export interface PrivateCloudProductZapResultDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface SecurityConfigDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface SonarScanResultDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface UserDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
}

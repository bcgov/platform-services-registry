export interface PrivateCloudProductDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    reprovision: boolean;
    manageMembers: boolean;
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
    cancel: boolean;
  };
}

export interface PublicCloudProductDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    reprovision: boolean;
    downloadMou: boolean;
    manageMembers: boolean;
    editAccountCoding: boolean;
  };
}

export interface PublicCloudRequestDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    review: boolean;
    resend: boolean;
    signMou: boolean;
    reviewMou: boolean;
    delete: boolean;
    viewProduct: boolean;
    cancel: boolean;
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

export interface PrivateCloudProductWebhookDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface PublicCloudBillingDecorate {
  _permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
}

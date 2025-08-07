export const privateCloudProductSimpleInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  organization: true,
  requests: {
    where: {
      active: true,
    },
    include: {
      createdBy: true,
    },
  },
};

export const privateCloudProductDetailInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  organization: true,
  requests: {
    where: {
      active: true,
    },
    include: {
      createdBy: true,
    },
  },
};

export const privateCloudRequestSimpleInclude = {
  decisionMaker: true,
  cancelledBy: true,
  createdBy: true,
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      organization: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      organization: true,
    },
  },
};

export const privateCloudRequestDetailInclude = {
  decisionMaker: true,
  cancelledBy: true,
  createdBy: true,
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      organization: true,
    },
  },
  originalData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      organization: true,
    },
  },
  requestData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      organization: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      organization: true,
    },
  },
};

export const publicCloudProductSimpleInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  expenseAuthority: true,
  organization: true,
  requests: {
    where: {
      active: true,
    },
    include: {
      createdBy: true,
    },
  },
};

export const publicCloudProductDetailInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  expenseAuthority: true,
  organization: true,
  requests: {
    where: {
      active: true,
    },
    include: {
      createdBy: true,
    },
  },
};

export const publicCloudRequestSimpleInclude = {
  decisionMaker: true,
  cancelledBy: true,
  createdBy: true,
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      organization: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      organization: true,
    },
  },
};

export const publicCloudRequestDetailInclude = {
  decisionMaker: true,
  cancelledBy: true,
  createdBy: true,
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      organization: true,
    },
  },
  originalData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      organization: true,
    },
  },
  requestData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      organization: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      organization: true,
    },
  },
};

export const publicCloudBillingSimpleInclude = {
  signedBy: true,
  approvedBy: true,
  expenseAuthority: true,
};

export const publicCloudBillingDetailInclude = {
  signedBy: true,
  approvedBy: true,
  expenseAuthority: true,
};

export const privateCloudProductSimpleInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  requests: {
    where: {
      active: true,
    },
  },
};

export const privateCloudProductDetailInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  requests: {
    where: {
      active: true,
    },
  },
};

export const privateCloudRequestSimpleInclude = {
  decisionMaker: true,
  createdBy: true,
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
};

export const privateCloudRequestDetailInclude = {
  decisionMaker: true,
  createdBy: true,
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  originalData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  requestData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
};

export const publicCloudProductSimpleInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  expenseAuthority: true,
  requests: {
    where: {
      active: true,
    },
  },
};

export const publicCloudProductDetailInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  expenseAuthority: true,
  requests: {
    where: {
      active: true,
    },
  },
};

export const publicCloudRequestSimpleInclude = {
  decisionMaker: true,
  createdBy: true,
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
    },
  },
};

export const publicCloudRequestDetailInclude = {
  decisionMaker: true,
  createdBy: true,
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
    },
  },
  originalData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
    },
  },
  requestData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
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

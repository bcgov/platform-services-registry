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
  billing: {
    include: {
      expenseAuthority: true,
      signedBy: true,
      approvedBy: true,
    },
  },
  requests: {
    where: {
      active: true,
    },
  },
};

export const publicCloudRequestSimpleInclude = {
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
};

export const publicCloudRequestDetailInclude = {
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  originalData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  requestData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: {
        include: {
          expenseAuthority: true,
          signedBy: true,
          approvedBy: true,
        },
      },
    },
  },
};

export const userWithGitHubAccount = {
  include: {
    githubAccount: {
      select: {
        username: true,
        accountId: true,
      },
    },
  },
} as const;

export const privateCloudProductSimpleInclude = {
  projectOwner: userWithGitHubAccount,
  primaryTechnicalLead: userWithGitHubAccount,
  secondaryTechnicalLead: userWithGitHubAccount,
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
  projectOwner: userWithGitHubAccount,
  primaryTechnicalLead: userWithGitHubAccount,
  secondaryTechnicalLead: userWithGitHubAccount,
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
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      organization: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
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
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      organization: true,
    },
  },
  originalData: {
    include: {
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      organization: true,
    },
  },
  requestData: {
    include: {
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      organization: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      organization: true,
    },
  },
};

export const publicCloudProductSimpleInclude = {
  projectOwner: userWithGitHubAccount,
  primaryTechnicalLead: userWithGitHubAccount,
  secondaryTechnicalLead: userWithGitHubAccount,
  expenseAuthority: userWithGitHubAccount,
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
  projectOwner: userWithGitHubAccount,
  primaryTechnicalLead: userWithGitHubAccount,
  secondaryTechnicalLead: userWithGitHubAccount,
  expenseAuthority: userWithGitHubAccount,
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
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      expenseAuthority: userWithGitHubAccount,
      organization: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      expenseAuthority: userWithGitHubAccount,
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
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      expenseAuthority: userWithGitHubAccount,
      organization: true,
    },
  },
  originalData: {
    include: {
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      expenseAuthority: userWithGitHubAccount,
      organization: true,
    },
  },
  requestData: {
    include: {
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      expenseAuthority: userWithGitHubAccount,
      organization: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: userWithGitHubAccount,
      primaryTechnicalLead: userWithGitHubAccount,
      secondaryTechnicalLead: userWithGitHubAccount,
      expenseAuthority: userWithGitHubAccount,
      organization: true,
    },
  },
};

export const publicCloudBillingSimpleInclude = {
  signedBy: true,
  approvedBy: true,
  expenseAuthority: userWithGitHubAccount,
};

export const publicCloudBillingDetailInclude = {
  signedBy: true,
  approvedBy: true,
  expenseAuthority: userWithGitHubAccount,
};

import { createSelector } from 'reselect';
import { GithubIDBaseState } from './githubID.reducer';

const selectGithubID = (state: any) => state.githubID;

const selectTechnicalLeads = createSelector([selectGithubID], (githubIDTechnicalLeads) =>
  githubIDTechnicalLeads
    ? githubIDTechnicalLeads.technicalLeads
    : [{ ...GithubIDBaseState }, { ...GithubIDBaseState }],
);

const selectedProductOwner = createSelector([selectGithubID], (githubIDProductOwner) =>
  githubIDProductOwner ? githubIDProductOwner.productOwner : [{ ...GithubIDBaseState }],
);

export const selectAllPersona = createSelector([selectGithubID], (githubID) => githubID);

export const selectTechnicalLead = (position: number) =>
  createSelector([selectTechnicalLeads], (githubIDTechnicalLeads) => {
    return githubIDTechnicalLeads ? githubIDTechnicalLeads[position] : GithubIDBaseState;
  });

export const selectProductOwner = () =>
  createSelector([selectedProductOwner], (githubIDProductOwner) =>
    githubIDProductOwner ? githubIDProductOwner[0] : GithubIDBaseState,
  );

export default selectGithubID;

import { createSelector } from 'reselect';
import { GithubIDBaseState } from './githubID.reducer';

const selectGithubID = (state: any) => state.githubID;

const selectTechnicalLeads = createSelector(
  [selectGithubID],
  (githubIDTechnicalLeads) => githubIDTechnicalLeads.technicalLeads,
);

export const selectAllPersona = createSelector([selectGithubID], (githubID) => githubID);

export const selectTechnicalLead = (position: number) =>
  createSelector([selectTechnicalLeads], (githubIDTechnicalLeads) => {
    return githubIDTechnicalLeads ? githubIDTechnicalLeads[position] : GithubIDBaseState;
  });

export const selecProductOwner = createSelector(
  [selectGithubID],
  (githubID) => githubID.productOwner[0],
);

export default selectGithubID;

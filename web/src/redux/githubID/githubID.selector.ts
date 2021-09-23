import { createSelector } from 'reselect';

const selectGithubID = (state: any) => state.githubID;

export const selectAllPersona = createSelector([selectGithubID], (githubID) => githubID);

export const selectFirstTechnicalLeads = createSelector(
  [selectGithubID],
  (githubID) => githubID.TechnicalLeads[0],
);

export const selectSecondTechnicalLeads = createSelector(
  [selectGithubID],
  (githubID) => githubID.TechnicalLeads[1],
);

export const selecUpdatedProductOwner = createSelector([selectGithubID], (githubID) => githubID.productOwner[0]);

export default selectGithubID;

import { createSelector } from 'reselect';

const selectGithubID = (state: any) => state.githubID;

export const selectAllPersona = createSelector([selectGithubID], (githubID) => githubID);

export const selectSecondTechnicalLeads = createSelector(
  [selectGithubID],
  (githubID) => githubID.technicalLeads[1],
);

export const selectFirstTechnicalLeads = createSelector(
  [selectGithubID],
  (githubID) => githubID.technicalLeads[0],
);

export const selecProductOwner = createSelector(
  [selectGithubID],
  (githubID) => githubID.productOwner[0],
);

export default selectGithubID;

import { createSelector } from 'reselect';

const selectGithubID = (state: any) => state.githubID;

export const selectAllPersona = createSelector([selectGithubID], (githubID) => githubID);

export const selectFirstUpdatedTechnicalLeads = createSelector(
  [selectGithubID],
  (githubID) => githubID[1],
);

export const selectSecondUpdatedTechnicalLeads = createSelector(
  [selectGithubID],
  (githubID) => githubID[2],
);

export const selecUpdatedProductOwner = createSelector(
  [selectGithubID],
  (githubID) => githubID[0],
);

export default selectGithubID;

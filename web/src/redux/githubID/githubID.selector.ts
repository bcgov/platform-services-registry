import { createSelector } from 'reselect';

const selectGithubID = (state: any) => state.githubID;

export const selectGithubIDAllState = createSelector([selectGithubID], (githubID) => githubID);

export const selectFirstUpdatedTechnicalLeads = createSelector(
  [selectGithubID],
  (githubID) => githubID.FirstUpdatedTechnicalLeads,
);

export const selectSecondUpdatedTechnicalLeads = createSelector(
  [selectGithubID],
  (githubID) => githubID.SecondUpdatedTechnicalLeads,
);

export const selecUpdatedProductOwner = createSelector(
  [selectGithubID],
  (githubID) => githubID.updatedProductOwner,
);

export default selectGithubID;

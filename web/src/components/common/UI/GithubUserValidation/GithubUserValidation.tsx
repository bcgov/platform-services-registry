import React, { useEffect } from 'react';
import { Field } from 'react-final-form';
import { connect } from 'react-redux';
import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import {
  createNewTechnicalLeads,
  searchIdirUsers,
} from '../../../../redux/githubID/githubID.action';
import { GithubIdBaseInterface } from '../../../../redux/githubID/githubID.reducer';
import {
  selectProductOwner,
  selectTechnicalLead,
} from '../../../../redux/githubID/githubID.selector';
import AdaptedGithubUserDisplay from './AdaptedGithubUserDisplay';

interface GithubUserValidationInterface {
  name: string;
  persona: string;
  position: number;
  initialValue: string;
  defaultValue: string;
  selectedTechnicalLeads: GithubIdBaseInterface;
  productOwner: GithubIdBaseInterface;
  fetchUserStartAsync: any;
  instance: IPublicClientApplication;
  accounts: AccountInfo[];
  graphToken: string;
}
const GithubUserValidation: React.FC<GithubUserValidationInterface> = (props) => {
  const {
    name,
    persona,
    position,
    initialValue,
    defaultValue,
    selectedTechnicalLeads,
    productOwner,
    fetchUserStartAsync,
    instance,
    accounts,
    graphToken,
  } = props;

  const { inputKeyword, githubUser, notFound, everFetched } =
    persona === 'productOwner' ? productOwner : selectedTechnicalLeads;

  const githubValidator = (value: any) => {
    if (!value) {
      return 'Required';
    }
    if (everFetched && notFound) {
      return 'IDIR User Not Found. \nMake sure you are using an email address associated with an IDIR account';
    }
    if (inputKeyword && !everFetched) {
      return 'Still Loading IDIR User infomation';
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // first condition: prevent first time render trigger api call because we already use peresis store.
      // Second condition: only send api request if input change
      // Third condition: Until there's a new input, it won't run again if there's a notfound result
      if (githubUser?.login !== inputKeyword && inputKeyword.length !== 0 && !notFound) {
        fetchUserStartAsync(inputKeyword, persona, position, instance, accounts, graphToken);
      }
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputKeyword]);

  return (
    <Field<string>
      name={name}
      component={AdaptedGithubUserDisplay}
      placeholder="Write a github username"
      initialValue={initialValue}
      defaultValue={defaultValue}
      sx={{ textTransform: 'none' }}
      persona={persona}
      position={position}
      validate={githubValidator}
    />
  );
};

const mapStateToProps = (state: any, githubID: any) => ({
  selectedTechnicalLeads: selectTechnicalLead(githubID.position)(state),
  productOwner: selectProductOwner()(state),
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchUserStartAsync: (
    query: string,
    persona: string,
    position: number,
    instance: IPublicClientApplication,
    accounts: AccountInfo[],
    graphToken: string,
  ) => dispatch(searchIdirUsers(query, persona, position, instance, accounts, graphToken)),
  createNewTechnicalLeads: () => dispatch(createNewTechnicalLeads()),
});

export default connect(mapStateToProps, mapDispatchToProps)(GithubUserValidation);

import React, { useEffect } from 'react';

import { connect } from 'react-redux';
import { Field } from 'react-final-form';
import { createStructuredSelector } from 'reselect';
import { selectGithubIDAllState } from '../../../../redux/githubID/githubID.selector';
import AdaptedGithubUserDisplay from './AdaptedGithubUserDisplay';
import { searchGithubUsers } from '../../../../redux/githubID/githubID.action';
import getValidator from '../../../../utils/getValidator';

const validator = getValidator();

const GithubUserValidation: React.FC<any> = (props) => {
  const { name, initialValue, defaultValue, githubIDAllState, fetchUserStartAsync } = props;

  const getPersona = (inputName: string) => {
    const personaHandler = inputName.split(/[^A-Za-z0-9]/);
    let persona = 'updatedProductOwner';
    if (personaHandler[0].includes('TechnicalLeads')) {
      if (personaHandler[1] === '0') {
        persona = 'FirstUpdatedTechnicalLeads';
      } else {
        persona = 'SecondUpdatedTechnicalLeads';
      }
    }
    return persona;
  };

  const persona = getPersona(name);
  const { inputKeyword, githubUser } = githubIDAllState[persona];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // first condition: prevent first time render trigger api call because we already use peresis store.
      // Second condition: only send api request if input change
      if (githubUser?.login !== inputKeyword && inputKeyword.length !== 0) {
        fetchUserStartAsync(inputKeyword, persona);
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
      validate={validator.mustBeValidGithubName}
    />
  );
};

const mapStateToProps = createStructuredSelector({
  githubIDAllState: selectGithubIDAllState,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchUserStartAsync: (query: string, persona: string) =>
    dispatch(searchGithubUsers(query, persona)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GithubUserValidation);

import React, { useEffect } from 'react';
import { Field } from 'react-final-form';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  createNewTechnicalLeads,
  searchGithubUsers,
} from '../../../../redux/githubID/githubID.action';
import { selectAllPersona } from '../../../../redux/githubID/githubID.selector';
import AdaptedGithubUserDisplay from './AdaptedGithubUserDisplay';

const GithubUserValidation: React.FC<any> = (props) => {
  const {
    name,
    persona,
    position,
    initialValue,
    defaultValue,
    allPersona,
    fetchUserStartAsync,
  } = props;

  const githubValidator = (value: any) => {
    if (!value) {
      return 'Required';
    }
    if (allPersona[persona][position].everFetched && allPersona[persona][position].notFound) {
      return 'Github User Not Found';
    }
    if (allPersona[persona][position].inputKeyword && !allPersona[persona][position].everFetched) {
      return 'Still Loading Github User infomation';
    }
  };

  const { inputKeyword, githubUser, notFound } = allPersona[persona][position];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // first condition: prevent first time render trigger api call because we already use peresis store.
      // Second condition: only send api request if input change
      // Third condition: don't run again if there's a notfound result until there's ne
      if (githubUser?.login !== inputKeyword && inputKeyword.length !== 0 && !notFound) {
        fetchUserStartAsync(inputKeyword, persona, position);
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

const mapStateToProps = createStructuredSelector({
  allPersona: selectAllPersona,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchUserStartAsync: (query: string, persona: string, position: number) =>
    dispatch(searchGithubUsers(query, persona, position)),
  createNewTechnicalLeads: () => dispatch(createNewTechnicalLeads()),
});

export default connect(mapStateToProps, mapDispatchToProps)(GithubUserValidation);

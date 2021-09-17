import React, { useEffect } from 'react';
import { Field } from 'react-final-form';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { createNewTechnicalLeads, searchGithubUsers } from '../../../../redux/githubID/githubID.action';
import { selectAllPersona } from '../../../../redux/githubID/githubID.selector';
import AdaptedGithubUserDisplay from './AdaptedGithubUserDisplay';

const GithubUserValidation: React.FC<any> = (props) => {
  const { name, index, initialValue, defaultValue, allPersona, fetchUserStartAsync } = props;

  const githubValidator = (value: any) => {
    if (!value) {
      return "Required";
    }
    if (allPersona[index].everFetched && allPersona[index].notFound) {
      return 'Github User Not Found';
    } else if (allPersona[index].inputKeyword && !allPersona[index].everFetched) {
      return 'Still Loading Github User infomation';
    }

  };

  const { inputKeyword, githubUser } = allPersona[index]

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // first condition: prevent first time render trigger api call because we already use peresis store.
      // Second condition: only send api request if input change
      if (githubUser?.login !== inputKeyword && inputKeyword.length !== 0) {
        fetchUserStartAsync(inputKeyword, index);
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
      index={index}
      validate={githubValidator}
    />
  );
};

const mapStateToProps = createStructuredSelector({
  allPersona: selectAllPersona,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchUserStartAsync: (query: string, index: number) =>
    dispatch(searchGithubUsers(query, index)),
  createNewTechnicalLeads: () => dispatch(createNewTechnicalLeads())
});

export default connect(mapStateToProps, mapDispatchToProps)(GithubUserValidation);

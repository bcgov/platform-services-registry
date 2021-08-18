import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import { Field, useField } from 'react-final-form';
import { createStructuredSelector } from 'reselect';
import { selectGithubIDAllState } from '../../../../redux/githubID/githubID.selector';
import AdaptedTypeahead from './AdaptedTypeahead';
// import useKeyword from './useKeyword';
import { searchGithubUsers } from '../../../../redux/githubID/githubID.action';
import getValidator from '../../../../utils/getValidator';

const validator = getValidator();
interface GithubIDInboxProps {
  name: string;
  // defaultValue: string;
  // initialValue: string | undefined;
  // inputKeyword: string;
  // fetchUserStartAsync: any;
}

const GithubUserTypeahead: React.FC<any> = (props) => {
  const { name, initialValue, defaultValue, githubIDAllState, fetchUserStartAsync } = props;

  const getGithubIDKey = (reduxReference: string) => {
    const reduxReferenceHandler = reduxReference.split(/[^A-Za-z0-9]/);
    let GithubReduxKey = 'updatedProductOwner';
    if (reduxReferenceHandler[0].includes('TechnicalLeads')) {
      if (reduxReferenceHandler[1] === '0') {
        GithubReduxKey = 'FirstUpdatedTechnicalLeads';
      } else {
        GithubReduxKey = 'SecondUpdatedTechnicalLeads';
      }
    }
    return GithubReduxKey;
  };
  const reduxReference = getGithubIDKey(name);
  const { inputKeyword } = githubIDAllState[reduxReference];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputKeyword.length !== 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        fetchUserStartAsync(inputKeyword, reduxReference);
      }
      // Send Axios request here
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [inputKeyword]);

  return (
    <Field<string>
      name={name}
      component={AdaptedTypeahead}
      placeholder="Write a github username"
      initialValue={initialValue}
      defaultValue={defaultValue}
      sx={{ textTransform: 'none' }}
      reduxReference={reduxReference}
      validate={validator.mustBeValidGithubName}
    />
  );
};

const mapStateToProps = createStructuredSelector({
  githubIDAllState: selectGithubIDAllState,
  // notFound: selectIsGithubUserNotFound,
  // inputKeyword: selectCurrentUserInput,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchUserStartAsync: (query: string, reduxReference: string) =>
    dispatch(searchGithubUsers(query, reduxReference)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GithubUserTypeahead);

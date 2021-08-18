import React, { useEffect } from 'react';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { Box, Text, Flex, Image } from 'rebass';
import { string } from 'prop-types';
import TextInput from '../TextInput';
import {
  selectCurrentUserInput,
  selectGithubIDAllState,
  selectIsGithubInfoLoading,
  selectIsGithubUserNotFound,
} from '../../../../redux/githubID/githubID.selector';
import { githubUserKeywordInput } from '../../../../redux/githubID/githubID.action';

interface GithubUserInterface {
  avatar: string;
  id: string;
  name: string;
}

const User: React.FC<GithubUserInterface> = (props) => {
  const { name, id, avatar } = props;

  return (
    <Flex flexDirection="row" justifyContent="space-evenly">
      <Box
        sx={{
          width: '10%',
          maxWidth: '100px',
          pt: 2,
        }}
      >
        <Image
          src={avatar}
          alt={name}
          sx={{
            borderRadius: '50%',
          }}
        />
      </Box>
      <Flex flexDirection="column" justifyContent="center">
        <Text>Name: {name}</Text>
        <Text mt={2}>ID: {id}</Text>
      </Flex>
    </Flex>
  );
};

const AdaptedTypeahead: React.FC<any> = (props) => {
  const {
    input,
    GithubIDAllState,
    reduxReference,
    githubUserKeywordInputDispatch,
    ...rest
  } = props;

  // console.log('check if I can find a name', reduxReference);

  useEffect(() => {
    // console.log('in most child reduxReference', reduxReference);
    // console.log('in most child GithubIDAllState', GithubIDAllState);
    // console.log('in most child GithubIDAllState', GithubIDAllState[reduxReference].inputKeyword);
    if (input.value !== GithubIDAllState[reduxReference].inputKeyword) {
      githubUserKeywordInputDispatch(reduxReference, input.value);
    }
  }, [input]);

  // const debouncedChangeHandler = useCallback(debounce(changeHandler, 300), []);

  return (
    <>
      <TextInput id="my-typeahead-id" {...input} {...rest} />
      {GithubIDAllState[reduxReference].isLoading && (
        <Text as="h4" mt={2}>
          Loading...
        </Text>
      )}
      {GithubIDAllState[reduxReference].notFound && (
        <Text as="h4" mt={2}>
          User was not found! :(
        </Text>
      )}
      {GithubIDAllState[reduxReference].githubUser && (
        <User
          name={GithubIDAllState[reduxReference].githubUser.name}
          id={GithubIDAllState[reduxReference].githubUser.id}
          avatar={GithubIDAllState[reduxReference].githubUser.avatar_url}
        />
      )}
    </>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  githubUserKeywordInputDispatch: (reduxReference: Array<string>, inputKeyworkd: string) =>
    dispatch(githubUserKeywordInput(reduxReference, inputKeyworkd)),
});

const mapStateToProps = createStructuredSelector({
  GithubIDAllState: selectGithubIDAllState,
  isLoading: selectIsGithubInfoLoading,
  inputKeyword: selectCurrentUserInput,
  notFound: selectIsGithubUserNotFound,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdaptedTypeahead);

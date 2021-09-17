import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Box, Flex, Image, Text } from 'rebass';
import { createStructuredSelector } from 'reselect';
import { githubUserKeywordInput } from '../../../../redux/githubID/githubID.action';
import {
  selectAllPersona
} from '../../../../redux/githubID/githubID.selector';
import TextInput from '../TextInput';

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
          width: ' clamp(30px, 60px, 100px);',
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

const AdaptedGithubUserDisplay: React.FC<any> = (props) => {
  const { input: userFieldInputEvent, name, allPersona, index, initialValue, dispatchGithubUserKeywordInput, ...rest } = props;

  useEffect(() => {
    if (userFieldInputEvent.value !== allPersona[index].inputKeyword) {
      const inputValue = userFieldInputEvent.value
      dispatchGithubUserKeywordInput({ index, inputValue });
    }
  }, [userFieldInputEvent, allPersona, dispatchGithubUserKeywordInput, index]);

  return (
    <>
      <TextInput {...userFieldInputEvent} {...rest} />
      {allPersona[index].isLoading && (
        <Text as="h4" mt={2}>
          Loading...
        </Text>
      )}
      {allPersona[index].notFound && (
        <Text as="h4" mt={2}>
          User was not found! :(
        </Text>
      )}
      {allPersona[index].githubUser && (
        <User
          name={allPersona[index].githubUser.name}
          id={allPersona[index].githubUser.id}
          avatar={allPersona[index].githubUser.avatar_url}
        />
      )}
    </>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchGithubUserKeywordInput: (payload: { index: number, input: string }) =>
    dispatch(githubUserKeywordInput(payload)),
});

const mapStateToProps = createStructuredSelector({
  allPersona: selectAllPersona
});

export default connect(mapStateToProps, mapDispatchToProps)(AdaptedGithubUserDisplay);

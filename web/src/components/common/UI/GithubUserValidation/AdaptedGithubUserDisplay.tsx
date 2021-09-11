import React, { useEffect } from 'react';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { Box, Text, Flex, Image } from 'rebass';
import TextInput from '../TextInput';
import {
  selectGithubIDAllState,
  selectFirstUpdatedTechnicalLeads,
  selectSecondUpdatedTechnicalLeads,
  selecUpdatedProductOwner,
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
  const { input, githubIDAllState, persona, githubUserKeywordInputDispatch, ...rest } = props;

  // TODO(Billy): For some reason, except for product owner, other two github id state is not been store in persistStore

  useEffect(() => {
    if (input.value !== githubIDAllState[persona].inputKeyword) {
      githubUserKeywordInputDispatch(persona, input.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  return (
    <>
      <TextInput id="my-typeahead-id" {...input} {...rest} />
      {githubIDAllState[persona].isLoading && (
        <Text as="h4" mt={2}>
          Loading...
        </Text>
      )}
      {githubIDAllState[persona].notFound && (
        <Text as="h4" mt={2}>
          User was not found! :(
        </Text>
      )}
      {githubIDAllState[persona].githubUser && (
        <User
          name={githubIDAllState[persona].githubUser.name}
          id={githubIDAllState[persona].githubUser.id}
          avatar={githubIDAllState[persona].githubUser.avatar_url}
        />
      )}
    </>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  githubUserKeywordInputDispatch: (persona: Array<string>, inputKeyworkd: string) =>
    dispatch(githubUserKeywordInput(persona, inputKeyworkd)),
});

const mapStateToProps = createStructuredSelector({
  githubIDAllState: selectGithubIDAllState,
  firstUpdatedTechnicalLeads: selectFirstUpdatedTechnicalLeads,
  secondUpdatedTechnicalLeads: selectSecondUpdatedTechnicalLeads,
  updatedProductOwner: selecUpdatedProductOwner,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdaptedGithubUserDisplay);

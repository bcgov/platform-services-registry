import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Box, Flex, Image, Text } from 'rebass';
import { createStructuredSelector } from 'reselect';
import { githubUserKeywordInput } from '../../../../redux/githubID/githubID.action';
import { selectAllPersona } from '../../../../redux/githubID/githubID.selector';
import TextInput from '../TextInput';

interface GithubUserInterface {
  avatar: string;
  name: string;
}

const User: React.FC<GithubUserInterface> = (props) => {
  const { name, avatar } = props;

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
      </Flex>
    </Flex>
  );
};

const AdaptedGithubUserDisplay: React.FC<any> = (props) => {
  const {
    input: userFieldInputEvent,
    name,
    allPersona,
    persona,
    position,
    initialValue,
    dispatchGithubUserKeywordInput,
    ...rest
  } = props;

  useEffect(() => {
    if (userFieldInputEvent.value !== allPersona[persona][position].inputKeyword) {
      const inputValue = userFieldInputEvent.value;
      dispatchGithubUserKeywordInput({ persona, position, inputValue });
    }
    // eslint-disable-next-line
  }, [userFieldInputEvent]);

  const { isLoading, notFound, githubUser } = allPersona[persona][position];

  return (
    <>
      <TextInput {...userFieldInputEvent} {...rest} />
      {isLoading && (
        <Text as="h4" mt={2}>
          Loading...
        </Text>
      )}
      {notFound && (
        <Text as="h4" mt={2}>
          User was not found! :(
        </Text>
      )}
      {githubUser && <User name={githubUser.name} avatar={githubUser.avatar_url} />}
    </>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchGithubUserKeywordInput: (payload: {
    persona: string;
    inputValue: string;
    position: number;
  }) => dispatch(githubUserKeywordInput(payload)),
});

const mapStateToProps = createStructuredSelector({
  allPersona: selectAllPersona,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdaptedGithubUserDisplay);

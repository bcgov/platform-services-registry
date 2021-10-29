import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Box, Flex, Image, Text } from 'rebass';
import { createStructuredSelector } from 'reselect';
import { githubIDSearchKeyword } from '../../../../redux/githubID/githubID.action';
import { GithubIdBaseInterface } from '../../../../redux/githubID/githubID.reducer';
import {
  selecProductOwner,
  selectFirstTechnicalLeads,
  selectSecondTechnicalLeads,
} from '../../../../redux/githubID/githubID.selector';
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
    persona,
    firstTechnicalLeads,
    secondTechnicalLeads,
    productOwner,
    position,
    initialValue,
    dispatchSearchGithubIDInput,
    ...rest
  } = props;

  let validatingRole: GithubIdBaseInterface;
  if (persona === 'productOwner') {
    validatingRole = productOwner;
  } else if (position === 0) {
    validatingRole = firstTechnicalLeads;
  } else {
    validatingRole = secondTechnicalLeads;
  }

  const { isLoading, githubUser, notFound, inputKeyword } = validatingRole;

  useEffect(() => {
    if (userFieldInputEvent.value !== inputKeyword) {
      const inputValue = userFieldInputEvent.value;
      dispatchSearchGithubIDInput({ persona, position, inputValue });
    }
  }, [userFieldInputEvent.value, inputKeyword, persona, position, dispatchSearchGithubIDInput]);

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
  dispatchSearchGithubIDInput: (payload: {
    persona: string;
    inputValue: string;
    position: number;
  }) => dispatch(githubIDSearchKeyword(payload)),
});

const mapStateToProps = createStructuredSelector({
  firstTechnicalLeads: selectFirstTechnicalLeads,
  secondTechnicalLeads: selectSecondTechnicalLeads,
  productOwner: selecProductOwner,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdaptedGithubUserDisplay);

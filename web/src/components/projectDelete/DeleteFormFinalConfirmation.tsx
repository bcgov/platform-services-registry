import React, { useState, useEffect } from 'react';
import FormTitle from '../common/UI/FormTitle';
import { Flex, Text } from 'rebass';
import { StyledFormButton } from '../common/UI/Button';
import { Input } from '@rebass/forms';

const DeleteFormFinalConfirmation: React.FC<any> = ({ licensePlate, onSubmit }) => {
  const [userConfirmation, setUserConfirmation] = useState(false);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (userInput.toUpperCase() === licensePlate.toUpperCase()) {
      setUserConfirmation(true);
      setUserInput('');
    } else if (userInput.length > 0) {
      setUserConfirmation(false);
    }
  }, [userInput]);

  return (
    <>
      <FormTitle style={{ margin: 0, paddingBottom: '20px' }}>Final confirmaton</FormTitle>

      <Flex mb={2}>
        Please type{' '}
        <Text px="1" color="red">
          {licensePlate}
        </Text>
        to confirm
      </Flex>
      <Input
        onChange={(e: any) => {
          setUserInput(e.target.value);
        }}
      />
      <Flex flexDirection="row" justifyContent="center" mb="15px">
        <StyledFormButton
          onClick={onSubmit}
          style={{
            fontSize: '15px',
            backgroundColor: '#CF222E',
            color: '#F6F8FA',
            fontWeight: 'bold',
            width: '80%',
            opacity: userConfirmation ? '1' : '0.5',
          }}
          disabled={!userConfirmation}
        >
          I understand the consequences, delete this project
        </StyledFormButton>
      </Flex>
    </>
  );
};

export default DeleteFormFinalConfirmation;

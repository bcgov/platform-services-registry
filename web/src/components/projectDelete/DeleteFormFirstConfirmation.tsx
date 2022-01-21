import React from 'react';
import FormTitle from '../common/UI/FormTitle';
import { Flex, Text, Box } from 'rebass';
import { StyledFormButton } from '../common/UI/Button';

const DeleteFormFirstConfirmation: React.FC<any> = ({ licensePlate, nextPage, closeModal }) => {
  return (
    <>
      <FormTitle style={{ margin: 0, paddingBottom: '20px' }}>
        Delete Project {licensePlate}?
      </FormTitle>
      <Text mb={3}>
        Delete this project, you will delete all namespaces under this project. We can't recouver
        them once you delete.
      </Text>
      <Flex mb={2}>
        Are you sure you want to{' '}
        <Text px="1" color="red">
          permanently delete
        </Text>
        this project
      </Flex>
      <Flex flexDirection="row" justifyContent="space-between" mb="15px">
        <StyledFormButton smallButton onClick={closeModal}>
          Cancle
        </StyledFormButton>
        <StyledFormButton
          smallButton
          onClick={nextPage}
          style={{ backgroundColor: '#d3d3d3', color: '#036' }}
        >
          Delete
        </StyledFormButton>
      </Flex>
    </>
  );
};

export default DeleteFormFirstConfirmation;

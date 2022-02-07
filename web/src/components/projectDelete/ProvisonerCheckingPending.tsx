import React, { useState, useEffect } from 'react';
import { Text, Box, Flex } from 'rebass';
import { Field } from 'react-final-form';
import LoadingSpinner from '../common/UI/LoadingSpinner';
import FormTitle from '../common/UI/FormTitle';
import useRegistryApi from '../../hooks/useRegistryApi';
import { promptErrToastWithText } from '../../utils/promptToastHelper';
import useInterval from '../../hooks/useInterval';
import { StyledFormButton } from '../common/UI/Button';

const ProvisonerCheckingPending: React.FC<any> = ({
  licensePlate,
  nextPage,
  profileId,
  closeModal,
}) => {
  const [showDeletionCheckError, setShowDeletionCheckError] = useState(false);

  const api = useRegistryApi();
  useInterval(() => {
    async function wrap() {
      try {
        const projectDetails = await api.getProfileByProfileId(profileId);
        const {
          pvcDeletability,
          podsDeletability,
          namespaceDeletability,
          provisonerDeletionChecked,
        } = projectDetails.data;
        if (
          pvcDeletability &&
          podsDeletability &&
          namespaceDeletability &&
          provisonerDeletionChecked
        ) {
          nextPage();
        } else if (
          provisonerDeletionChecked &&
          (!pvcDeletability || !podsDeletability || !namespaceDeletability)
        ) {
          setShowDeletionCheckError(true);
        }
      } catch (err: any) {
        // when api returns 500 or queried profileState entry does not exist
        promptErrToastWithText('Something went wrong');
      }
    }
    wrap();
    // eslint-disable-next-line
  }, 1000 * 5);

  return (
    <Flex flexDirection="column" height="100%">
      {showDeletionCheckError ? (
        <>
          <FormTitle style={{ margin: 0, paddingBottom: '20px' }}>
            Project {licensePlate} health check Finished{' '}
          </FormTitle>
          <Text pb="2">Provisoner check failed.</Text>
          <Text>Please do another self-check before delete this project.</Text>
          <Flex flexDirection="row" justifyContent="center" mb="15px">
            <StyledFormButton smallButton onClick={closeModal}>
              Close
            </StyledFormButton>
          </Flex>
        </>
      ) : (
        <>
          <FormTitle style={{ margin: 0, paddingBottom: '20px' }}>
            Project {licensePlate} heath check in progress...{' '}
          </FormTitle>
          <Box height="30%" mb="4">
            <LoadingSpinner />
          </Box>
        </>
      )}
    </Flex>
  );
};

export default ProvisonerCheckingPending;

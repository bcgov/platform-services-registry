import React, { useRef, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import getDecodedToken from '../utils/getDecodedToken';
import DeleteFormFirstConfirmation from '../components/projectDelete/DeleteFormFirstConfirmation';
import DeleteFormSecondConfirmation from '../components/projectDelete/DeleteFormSecondConfirmation';
import ProvisonerCheckingPending from '../components/projectDelete/ProvisonerCheckingPending';
import DeleteFormFinalConfirmation from '../components/projectDelete/DeleteFormFinalConfirmation';
import { ROUTE_PATHS } from '../constants';
import { Redirect } from 'react-router-dom';
import { promptErrToastWithText, promptSuccessToastWithText } from '../utils/promptToastHelper';
import useRegistryApi from '../hooks/useRegistryApi';
import { async } from 'validate.js';

interface ProjectDeletionModalInterface {
  licensePlate: string;
  profileId: string;
  closeDeletionModal: any;
}
export const ProjectDeletionModal: React.FC<ProjectDeletionModalInterface> = (props) => {
  const api = useRegistryApi();
  const { licensePlate, profileId, closeDeletionModal } = props;
  const [currentPage, setPage] = useState(1);
  const [goBackToDashboard, setGoBackToDashboard] = useState<boolean>(false);

  const { keycloak } = useKeycloak();

  const decodedToken = getDecodedToken(`${keycloak?.token}`);
  // @ts-ignore
  const userRoles = decodedToken.resource_access['registry-web']
    ? // @ts-ignore
      decodedToken.resource_access['registry-web'].roles
    : [];

  const isUserAdmin = userRoles.includes('administrator');
  const currentUserName = `${decodedToken.given_name} ${decodedToken.family_name}`;

  const nextPage = () => {
    setPage(currentPage + 1);
  };

  const previousPage = () => {
    setPage(currentPage - 1);
  };

  const onSubmit = async () => {
    // console.log('submit!!');
    try {
      const response = await api.deleteProjectByProfileId(profileId);
      console.log('what is response', response);
    } catch (err: any) {
      const msg = 'Unable to Send deletion requets';
      throw new Error(`${msg}, reason = ${err.message}`);
    }
    promptSuccessToastWithText('Your deletion request was successful');
    setGoBackToDashboard(true);
  };
  if (goBackToDashboard) {
    return <Redirect to={ROUTE_PATHS.DASHBOARD} />;
  }
  return (
    <div>
      {currentPage === 1 && (
        <DeleteFormFirstConfirmation
          closeModal={closeDeletionModal}
          nextPage={() => nextPage()}
          licensePlate={licensePlate}
        />
      )}
      {currentPage === 2 && (
        <DeleteFormSecondConfirmation
          nextPage={() => nextPage()}
          previousPage={previousPage}
          licensePlate={licensePlate}
        />
      )}
      {currentPage === 3 && (
        <ProvisonerCheckingPending
          nextPage={() => nextPage()}
          closeModal={closeDeletionModal}
          licensePlate={licensePlate}
          profileId={profileId}
        />
      )}
      {currentPage === 4 && (
        <DeleteFormFinalConfirmation
          onSubmit={() => onSubmit()}
          previousPage={previousPage}
          licensePlate={licensePlate}
        />
      )}
    </div>
  );
};

export default ProjectDeletionModal;

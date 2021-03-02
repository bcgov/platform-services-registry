//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { Label } from '@rebass/forms';
import React from 'react';
import getValidator from '../../utils/getValidator';
import {
  ConfirmationButtons,
  Message,

  NoButton, YesButton
} from './DashboardModal.style';

interface RejectRequestModalProps {
	onConfirm: () => void;
	onCancel: () => void;
  message: string;
}

export const RejectRequestModal: React.FC<
RejectRequestModalProps
> = ( props ) => {
  const validator = getValidator();
	return (
		<React.Fragment>
      <Message>{props.message}</Message>
      <Label htmlFor="project-description">Description</Label>
        <textarea
          name="project-description"
          placeholder="A cutting edge web platform that enables Citizens to ..."
        />
      <ConfirmationButtons>
        <YesButton onClick={props.onConfirm}>Yes</YesButton>
        <NoButton onClick={props.onCancel}>No</NoButton>
      </ConfirmationButtons>
		</React.Fragment>
	);
};
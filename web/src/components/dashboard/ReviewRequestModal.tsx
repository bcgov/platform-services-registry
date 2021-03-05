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
import { ConfirmationButtons, NoButton, TextArea, YesButton } from './DashboardModal.style';

interface ReviewRequestModalProps {
	onApprove: () => void;
	onReject: () => void;
  message: string;
}

export const ReviewRequestModal: React.FC<
ReviewRequestModalProps
> = props => {



	return (
		<React.Fragment>
      <Label>{props.message}</Label>
      <Label htmlFor="project-description">Additional information: </Label>
        <TextArea
          name="project-description"
          rows={5}
        />
      <ConfirmationButtons>
        <YesButton onClick={props.onApprove}>Approve</YesButton>
        <NoButton onClick={props.onReject}>Reject</NoButton>
      </ConfirmationButtons>
		</React.Fragment>
	);
};
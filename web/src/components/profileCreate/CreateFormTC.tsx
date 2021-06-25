//
// Copyright © 2020 Province of British Columbia
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

import React, { useState } from 'react';
import { Box, Flex } from 'rebass';
import Aux from '../../hoc/auxillary';
import { AddFormTC } from '../common/UI/AddFormTC';
import { StyledFormButton } from '../common/UI/Button';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';

const CreateFormTC: React.FC = () => {
  const [TCcount, setTCcount] = useState(1);


  const changeTCCount = (increment: number) => {
    if (TCcount + increment > 0 && TCcount + increment <= 2) {
      setTCcount(TCcount + increment);
    }
  }

  let tcs: any = []
  for (let count = 0; count < TCcount; count++) {
    const FormTCKey = `tc${count}`;
    tcs.push(
      <Flex flexDirection='column'>
        <Flex flexDirection="row">
          <FormTitle>Technical Contact {count + 1}</FormTitle>
          <Box ml='auto' className="buttons">
            {count === 1 && (
              <StyledFormButton
                type="button"
                onClick={() => changeTCCount(-1)}
                style={{ backgroundColor: '#d3d3d3', color: '#036', width: '40px', height: '40px' }}
              >
                -
              </StyledFormButton>
            )}
            {count === 0 && (
              <StyledFormButton
                type="button"
                onClick={() => changeTCCount(1)}
                style={{ width: '40px', height: '40px' }}
              >
                +
              </StyledFormButton>
            )}
          </Box >
        </Flex>
        <AddFormTC key={FormTCKey} count={count} />
      </Flex>
    );
  }

  return (
    <Aux>
      <FormTitle>Who is the technical contact for this project?</FormTitle>
      <FormSubtitle>
        Tell us about the Technical Contact (TC). This is typically the DevOps specialist; we will
        use this information to contact them with technical questions or notify them about platform
        events. You can list up to 3 Technical Contacts.
      </FormSubtitle>
      
      {tcs}
      
    </Aux >

  );
};

export default CreateFormTC;

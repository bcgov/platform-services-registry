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
import Aux from '../../hoc/auxillary';
import { StyledFormButton } from '../common/UI/Button';
import { AddFormTC, FormTC } from '../common/UI/FormTC';

const CreateFormTC: React.FC = () => {
  const [TCcount, setTCcount] = useState(1);

  const changeTCCount = (increment: number) => {
    if (TCcount + increment > 0 && TCcount + increment <= 3) {
      setTCcount(TCcount + increment);
    }
  }

  let tcs = []
  for (let count = 1; count < TCcount + 1; count++) {
    const FormTCKey = `tc${count}`;
    (count === 1) ? tcs.push(<FormTC key={FormTCKey} count={count} />) : tcs.push(<AddFormTC key={FormTCKey} count={count} />);
  }

  return (
    <Aux>
      { tcs}
      <div className="buttons">
        {(
          <StyledFormButton
            type="button"
            onClick={() => changeTCCount(-1)}
            style={{ backgroundColor: '#d3d3d3', color: '#036' }}
          >
            Remove TC
          </StyledFormButton>
        )}
        {(
          <StyledFormButton
            type="button"
            onClick={() => changeTCCount(1)}
          >
            Add TC
          </StyledFormButton>
        )}
      </div >
    </Aux >

  );
};

export default CreateFormTC;

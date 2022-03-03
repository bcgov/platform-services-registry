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

import styled from '@emotion/styled';
import React from 'react';

const TooltipStyles = styled.div`
  .tooltip-container {
    position: relative;
  }

  .tooltip-box {
    position: absolute;
    width: 130px;
    right: 105%;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 5px;
    border-radius: 5px;
    display: none;
    margin: 10px 0 0 0;
  }

  .tooltip-box.visible {
    display: block;
  }

  .tooltip-arrow {
    position: absolute;
    right: -10px;
    top: 35%;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent transparent rgba(0, 0, 0, 0.7);
  }
`;
const Tooltip: React.FC<any> = ({ children, text, ...rest }) => {
  const [show, setShow] = React.useState(false);

  return (
    <TooltipStyles>
      <div className="tooltip-container">
        <div className={show ? 'tooltip-box visible' : 'tooltip-box'}>
          {text}
          <span className="tooltip-arrow" />
        </div>
        <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} {...rest}>
          {children}
        </div>
      </div>
    </TooltipStyles>
  );
};

export default Tooltip;

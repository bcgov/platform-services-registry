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

import styled from '@emotion/styled';
import theme from '../../../theme';

export const BackdropForPendingItem = styled.div`
  position: absolute;
  z-index: ${theme.zIndices[0]};
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: white;
  opacity: 0.5;
`;

export const BackdropForProcessing = styled.div`
  position: fixed;
  z-index: ${theme.zIndices[2]};
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
`;

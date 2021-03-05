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

export const Wrapper = styled.div`
    width 80%;
    @media(min-width: 768px) {
    width: 60%;
    }
    @media(min-width: 1024px) {
    width: 40%;
    }
`;

export const ConfirmationButtons = styled.div`
	display: flex;
	justify-content: center;
`;

export const Message = styled.div`
	font-size: 0.9rem;
	margin-bottom: 1em;
	text-align: center;
`;

export const YesButton = styled.button`
	width: 6rem;
  margin-bottom: 0.5em;
`;

export const NoButton = styled.button`
width: 6rem;
  margin-left: 10px;
  margin-bottom: 0.5em;
`;

export const TextArea = styled('textarea')`
box-sizing: border-box;
margin: 0;
min-width: 0;
display: block;
width: 100%;
padding: 8px;
-webkit-appearance: none;
-moz-appearance: none;
appearance: none;
font-size: inherit;
line-height: inherit;
border: 1px solid;
border-radius: default;
color: inherit;
background-color: transparent;
border-radius: 5px;
border: solid 1px #036;
background-color: #fafafa;
color: #036;
resize: none;
margin-bottom: 1em;
`;
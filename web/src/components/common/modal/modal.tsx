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

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import FocusLock from 'react-focus-lock';
import {
  Backdrop,
  CloseButton,
  Content,
  Header,
  HeaderText,
  StyledModal,
  Wrapper,
} from './modal.style';

export interface ModalProps {
  isShown: boolean;
  hide: () => void;
  modalContent: JSX.Element;
  headerText: string;
}

export const Modal: React.FC<ModalProps> = ({ isShown, hide, modalContent, headerText }) => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isShown) {
      hide();
    }
  };

  useEffect(() => {
    isShown ? (document.body.style.overflow = 'hidden') : (document.body.style.overflow = 'unset');
    document.addEventListener('keydown', onKeyDown, false);
    return () => {
      document.removeEventListener('keydown', onKeyDown, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShown]);

  const modal = (
    <>
      <Backdrop onClick={hide} />
      <FocusLock>
        <Wrapper aria-modal aria-labelledby={headerText} tabIndex={-1} role="dialog">
          <StyledModal>
            <Header>
              <HeaderText>{headerText}</HeaderText>
              <CloseButton onClick={hide}>X</CloseButton>
            </Header>
            <Content>{modalContent}</Content>
          </StyledModal>
        </Wrapper>
      </FocusLock>
    </>
  );

  return isShown ? ReactDOM.createPortal(modal, document.body) : null;
};

import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../../../redux/githubID/graphAuthConfig";
import styled from '@emotion/styled';

import { connect } from 'react-redux';
import { Box, Flex, Image, Text } from 'rebass';


export interface IButtonProps {
    children?: React.ReactNode;
    onClick?: (e: any) => void;
  }

function handleLogin(instance: any) {
    instance.loginPopup(loginRequest).catch((e: any) => {
        console.error(e);
    });
}

export const StyledButton = styled.button`
  padding: 8px 16px;
  border: none;
  background-color: #fcba19;
  color: #003366;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-radius: 2px;
  cursor: pointer;
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
`;

/**
 * Renders a button which, when selected, will open a popup for login
 */

const AzureSignInButton: React.SFC<IButtonProps> = (props) => {
    const { instance } = useMsal();
    return (
      <StyledButton onClick={() => handleLogin(instance)}>
        {"Get Azure Token"}
      </StyledButton>
    );
  };
  
  AzureSignInButton.defaultProps = {
    children: null,
    onClick: () => {
      // this is intentional (required by Sonarcloud)
    },
  };
  
  export default AzureSignInButton;

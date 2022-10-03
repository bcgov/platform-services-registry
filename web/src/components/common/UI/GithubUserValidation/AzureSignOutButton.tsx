import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../../../redux/githubID/graphAuthConfig";
import styled from '@emotion/styled';

export interface IButtonProps {
    children?: React.ReactNode;
    onClick?: (e: any) => void;
  }

function handleLogout(instance: any) {
    // instance.logoutPopup().catch((e: any) => {
    //     console.error(e);
    // });
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

const Button: React.SFC<IButtonProps> = (props) => {
    const { instance } = useMsal();
    return (
      <StyledButton onClick={() => handleLogout(instance)}>
        {"revoke azure token"}
      </StyledButton>
    );
  };
  
  Button.defaultProps = {
    children: null,
    onClick: () => {
      // this is intentional (required by Sonarcloud)
    },
  };
  
  export default Button;

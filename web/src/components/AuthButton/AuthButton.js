//
// DevHub
//
// Copyright © 2018 Province of British Columbia
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
// Created by Jason Leach on 2018-10-03.
//

import PropTypes from 'prop-types';
import React from 'react';
import implicitAuthManager from '../../auth';
import './AuthButton.css';

const titleForAuthenticationState = isAuthenticated => {
  if (isAuthenticated) {
    return 'Logout';
  }

  return 'Login';
};

const locationForCurrentState = isAuthenticated => {
  if (isAuthenticated) {
    return implicitAuthManager.getSSOLogoutURI();
  }

  return implicitAuthManager.getSSOLoginURI();
};

const AuthButton = ({ isAuthenticated }) => {
  return (
    <span>
      <button
        className="auth-button"
        onClick={() => {
          window.location.assign(locationForCurrentState(isAuthenticated));
        }}
      >
        {titleForAuthenticationState(isAuthenticated)}
      </button>
    </span>
  );
};

AuthButton.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export default AuthButton;

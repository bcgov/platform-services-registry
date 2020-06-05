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
// Created by Jason Leach on 2018-09-26.
//

import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <ul>
        <li>
          <a href=".">Home</a>
        </li>
        <li>
          <a href="https://www2.gov.bc.ca/gov/content/home/disclaimer">Disclaimer</a>
        </li>
        <li>
          <a href="https://www2.gov.bc.ca/gov/content/home/privacy">Privacy</a>
        </li>
        <li>
          <a href="https://www2.gov.bc.ca/gov/content/home/accessibility">Accessibility</a>
        </li>
        <li>
          <a href="https://www2.gov.bc.ca/gov/content/home/copyright">Copyright</a>
        </li>
        <li>
          <a href="https://github.com/bcgov/devhub-signing-web">Contact Us</a>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;

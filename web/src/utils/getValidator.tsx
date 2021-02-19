//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import validate from 'validate.js';

const schema = {
  email: {
    presence: { allowEmpty: false, message: 'Required' },
    email: {
      message: 'Invalid format',
    },
    length: {
      maximum: 32,
      tooLong: 'Max 32 characters',
    },
  },
  profileName: {
    presence: { allowEmpty: false, message: 'Required' },
    length: {
      maximum: 40,
      tooLong: 'Max 40 characters',
    },
    format: {
      pattern: '^[a-zA-Z][A-Za-z0-9 ]+',
      flags: 'i',
      message: 'Must be alphanumetic starting with a letter',
    },
  },
  profileDescription: {
    presence: { allowEmpty: false, message: 'Required' },
    length: {
      maximum: 512,
      tooLong: 'Max 512 characters',
    },
    format: {
      pattern: '^[A-Za-z0-9\n ,)(.!?"\']+',
      flags: 'i',
      message: 'No special characters allowed',
    },
  },
  componenentOthers: {
    length: {
      maximum: 512,
      tooLong: 'Max 512 characters',
    },
    format: { pattern: '^(?! ).+[A-Za-z0-9 ,)(.!?"\']+', flags: 'i', message: 'Invalid format' },
  },
  name: {
    presence: { allowEmpty: false, message: 'Required' },
    length: {
      maximum: 32,
      tooLong: 'Max 32 characters',
    },
    format: { pattern: '[A-Za-z]+', flags: 'i', message: 'Must be alphabetic' },
  },
  githubName: {
    presence: { allowEmpty: false, message: 'Required' },
    length: {
      maximum: 32,
      tooLong: 'Max 32 characters',
    },
    format: { pattern: '[A-Za-z0-9-]+', flags: 'i', message: 'Invalid Github account format' },
  },
  busOrgId: {
    presence: { allowEmpty: false, message: 'Required' },
  },
  migratingLicenseplate: {
    presence: { allowEmpty: false, message: 'Required' },
    length: {
      maximum: 32,
      tooLong: 'Max 32 characters',
    },
    format: {
      pattern: '[A-Za-z0-9-_]+',
      flags: 'i',
      message: 'Must only contain alphanumetic characters, hyphens or underscores',
    },
  },
};

export default function getValidator() {
  const mustBeValidEmail = (value: any) => {
    const errors = validate({ email: value }, schema, { fullMessages: false });
    if (errors && errors.email) {
      return errors.email[0];
    }
  };

  const mustBeValidProfileName = (value: any) => {
    const errors = validate({ profileName: value }, schema, { fullMessages: false });
    if (errors && errors.profileName) {
      return errors.profileName[0];
    }
  };

  const mustBeValidProfileDescription = (value: any) => {
    const errors = validate({ profileDescription: value }, schema, { fullMessages: false });
    if (errors && errors.profileDescription) {
      return errors.profileDescription[0];
    }
  };

  const mustBeValidName = (value: any) => {
    const errors = validate({ name: value }, schema, { fullMessages: false });
    if (errors && errors.name) {
      return errors.name[0];
    }
  };

  const mustBeValidGithubName = (value: any) => {
    const errors = validate({ githubName: value }, schema, { fullMessages: false });
    if (errors && errors.githubName) {
      return errors.githubName[0];
    }
  };

  const mustBeValidComponentOthers = (value: any) => {
    const errors = validate({ componenentOthers: value }, schema, { fullMessages: false });
    if (errors && errors.componenentOthers) {
      return errors.componenentOthers[0];
    }
  };

  const mustBeValidBusOrgId = (value: any) => {
    const errors = validate({ busOrgId: value }, schema, { fullMessages: false });
    if (errors && errors.componenentOthers) {
      return errors.componenentOthers[0];
    }
  };

  const mustBeValidProfileLicenseplate = (value: any) => {
    const errors = validate({ migratingLicenseplate: value }, schema, { fullMessages: false });
    if (errors && errors.migratingLicenseplate) {
      return errors.migratingLicenseplate[0];
    }
  };

  return {
    mustBeValidEmail,
    mustBeValidProfileName,
    mustBeValidProfileDescription,
    mustBeValidName,
    mustBeValidGithubName,
    mustBeValidComponentOthers,
    mustBeValidBusOrgId,
    mustBeValidProfileLicenseplate,
  };
}

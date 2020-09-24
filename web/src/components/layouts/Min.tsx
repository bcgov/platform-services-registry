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

import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Flex } from 'rebass';
import Footer from '../footer';
import Header from '../header';

const Min: React.FC = (props) => {
  const { children } = props;
  return (
    <div >
      <ToastContainer style={{ width: "500px" }} />
      <Header />
      <Flex px={['60px', '130px']}>
        <main>
          {children}
        </main>
      </Flex>
      <Footer />
    </div>
  );
};

export default Min;
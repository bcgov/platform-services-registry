import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Flex } from 'rebass';
import Footer from '../components/footer';
import Header from '../components/header';

const WithLayout = (Component: React.FC) => (props: any) => {
  return (
    <div >
      <ToastContainer style={{ width: "500px" }} />
      <Header />
      <Flex px={['60px', '130px']}>
        <Component {...props} />
      </Flex>
      <Footer />
    </div>
  )
}

export default WithLayout;

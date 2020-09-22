import { Router } from '@reach/router';
import React from 'react';
import WithLayout from '../hoc/withLayout';
import Form from './form';

const ViewForm = WithLayout(Form);

const AppRouter: React.FC = () => {
  return (
    <Router>
      <ViewForm path="/" />
    </Router>
  );
};

export default AppRouter;
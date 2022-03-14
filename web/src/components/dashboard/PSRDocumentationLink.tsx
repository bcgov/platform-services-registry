import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Text } from 'rebass';

const PSRDocumentationLink: React.FC = () => {
  return (
    <Box>
      <Text>
        Git documentation for Platform Services Registry and a link to report issues can be found
        <Link to="https://github.com/bcgov/platform-services-registry">here</Link>
      </Text>
    </Box>
  );
};

export default PSRDocumentationLink;

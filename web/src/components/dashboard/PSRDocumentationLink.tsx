import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Text } from 'rebass';

const PSRDocumentationLink: React.FC = () => {
  return (
    <Box>
      <Text>
        Git documentation for Platform Services Registry and a link to report issues can be found
        &nbsp;
        <a href="https://github.com/bcgov/platform-services-registry" target="_blank">
          here.
        </a>
      </Text>
    </Box>
  );
};

export default PSRDocumentationLink;

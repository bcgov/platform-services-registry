import React from 'react';
import { Box, Flex } from 'rebass';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

const rotate = keyframes`
0% {
    transform: rotate(0);
}
100% {
    transform: rotate(360deg);
}
`;
const StyledLoading = styled.div`
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1.5px solid transparent;
  border-top-color: #9370ea;
  animation: ${rotate} 2s linear infinite;

  &:before {
    content: '';
    position: absolute;
    top: 2px;
    right: 2px;
    bottom: 2px;
    left: 2px;
    border-radius: 50%;
    border: 1.5px solid transparent;
    border-top-color: #5a85e5;
    animation: ${rotate} 3s linear infinite;
  }
  &:after {
    content: '';
    position: absolute;
    top: 5px;
    right: 5px;
    bottom: 5px;
    left: 5px;
    border-radius: 50%;
    border: 1.5px solid transparent;
    border-top-color: #f0f;
    animation: ${rotate} 1.5s linear infinite;
  }
`;
const LoadingSpinner = () => {
  return (
    <Flex justifyContent="center" alignItems="center">
      <StyledLoading />
    </Flex>
  );
};

export default LoadingSpinner;

import styled from '@emotion/styled';
import React from 'react';

// TODO:(sb) This styling is admittedly quite hacky. It should be revisited and optimized for greater re-usability
// It could be good to explore a more robust solution such as react popper.js in the future
const TooltipStyles = styled.div`
  .tooltip-container {
    position: relative;
  }

  .tooltip-box {
    position: absolute;
    width: 130px;
    right: 105%;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 5px;
    border-radius: 5px;
    display: none;
    margin: 10px 0 0 0;
  }

  .tooltip-box.visible {
    display: block;
  }

  .tooltip-arrow {
    position: absolute;
    right: -10px;
    top: 35%;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent transparent rgba(0, 0, 0, 0.7);
  }
`;
const Tooltip: React.FC<any> = ({ children, text, ...rest }) => {
  const [show, setShow] = React.useState(false);

  return (
    <TooltipStyles>
      <div className="tooltip-container">
        <div className={show ? 'tooltip-box visible' : 'tooltip-box'}>
          {text}
          <span className="tooltip-arrow" />
        </div>
        <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} {...rest}>
          {children}
        </div>
      </div>
    </TooltipStyles>
  );
};

export default Tooltip;

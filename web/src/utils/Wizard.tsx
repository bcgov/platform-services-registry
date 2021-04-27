import React, { useState } from 'react';
import { Form } from 'react-final-form';
import { Flex } from 'rebass';
import { StyledFormButton } from '../components/common/UI/Button';
import { ShadowBox } from '../components/common/UI/ShadowContainer';

export const WizardPage: React.FC = ({ children }) => <div>{children}</div>;

const Wizard: React.FC<any> = ({ onSubmit, children }) => {
  const [values, setValues] = useState<any | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [isLastPage, setLastPage] = useState(false);
  const activePage = React.Children.toArray(children)[page];

  // next page
  const next = (formData: any) => {
    setPage(Math.min(page + 1, React.Children.count(children)));
    setValues(formData);
  };

  // previous page
  const previous = () => {
    setPage(Math.max(page - 1, 0));
    setLastPage(false);
  };

  const handleSubmit = (formData: any) => {
    setLastPage(page === React.Children.count(children) - 2);
    if (isLastPage) {
      return onSubmit(values);
    }
    next(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {(props) => (
        <form onSubmit={props.handleSubmit}>
          <Flex flexWrap="wrap" mx={-2}>
            <ShadowBox
              maxWidth="750px"
              p="24px"
              mt="0px"
              px={['24px', '24px', '70px']}
              width={[1, 1, 2 / 3]}
              mx="auto"
            >
              {activePage}
              <div className="buttons">
                {page > 0 && (
                  <StyledFormButton
                    type="button"
                    onClick={previous}
                    style={{ backgroundColor: '#d3d3d3', color: '#036' }}
                  >
                    Previous
                  </StyledFormButton>
                )}
                {isLastPage ? (
                  <StyledFormButton>Request</StyledFormButton>
                ) : (
                  <StyledFormButton>Next</StyledFormButton>
                )}
              </div>
            </ShadowBox>
          </Flex>
        </form>
      )}
    </Form>
  );
};

export default Wizard;

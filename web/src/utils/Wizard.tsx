import arrayMutators from 'final-form-arrays';
import React, { useState } from 'react';
import { Form } from 'react-final-form';
import { Flex } from 'rebass';
import { FORM_ERROR } from 'final-form';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { Label } from '@rebass/forms';
import { StyledFormButton } from '../components/common/UI/Button';
import { ShadowBox } from '../components/common/UI/ShadowContainer';
import { selectGithubIDAllState } from '../redux/githubID/githubID.selector';

export const WizardPage: React.FC = ({ children }) => <div>{children}</div>;

const Wizard: React.FC<any> = ({ onSubmit, children, GithubIDAllState }) => {
  const [values, setValues] = useState<any | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [isLastPage, setLastPage] = useState(false);
  const activePage = React.Children.toArray(children)[page];

  // next page
  const next = (formData: any) => {
    console.log('hiahai', formData);
    setPage(Math.min(page + 1, React.Children.count(children)));
    setValues(formData);
  };

  // previous page
  const previous = () => {
    setPage(Math.max(page - 1, 0));
    setLastPage(false);
  };

  const handleSubmit = (formData: any) => {
    // page 2 and page 3 will need to validate github user ID
    if (page === 2 || page === 3) {
      let onSubmitErrorMessage;
      Object.entries(GithubIDAllState).forEach(([key, value]) => {
        if (GithubIDAllState[key].everFetched === true && GithubIDAllState[key].notFound === true) {
          onSubmitErrorMessage = 'Github User Not Found';
        }
        if (GithubIDAllState[key].inputKeyword && GithubIDAllState[key].everFetched === false) {
          onSubmitErrorMessage = 'Loading Github User infomation';
        }
      });
      if (onSubmitErrorMessage) return { [FORM_ERROR]: onSubmitErrorMessage };
    }

    setLastPage(page === React.Children.count(children) - 2);
    if (isLastPage) {
      return onSubmit(values);
    }
    next(formData);
  };

  return (
    <Form
      onSubmit={handleSubmit}
      mutators={{
        ...arrayMutators,
      }}
    >
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
                  <>
                    <StyledFormButton>Next</StyledFormButton>
                    {props.submitError && (
                      <Label as="span" variant="errorLabel">
                        {props.submitError}
                      </Label>
                    )}
                  </>
                )}
              </div>
            </ShadowBox>
          </Flex>
        </form>
      )}
    </Form>
  );
};

const mapStateToProps = createStructuredSelector({
  GithubIDAllState: selectGithubIDAllState,
});

export default connect(mapStateToProps)(Wizard);

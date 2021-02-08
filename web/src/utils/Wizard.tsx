import React, { useState } from "react";
import { Form } from "react-final-form";
import { Flex } from 'rebass';
import { StyledFormButton } from '../components/common/UI/Button';
import { ShadowBox } from '../components/common/UI/ShadowContainer';

type Wizard = {
  onSubmit: (values: Values) => void;
};

type Values = {
  name: String;
  surname: String;
  email: String;
  password: String;
  city: String;
  birthDay: Number;
  birthMonth: Number;
  birthYear: Number;
};

export const WizardPage: React.FC = ({ children }) => <div>{children}</div>; 

// 3-steps form
const Wizard: React.FC<Wizard> = ({ onSubmit, children }) => {
  const [page, setPage] = useState(0);
  const [values, setValues] = useState<Values | undefined>(undefined);
  const activePage = React.Children.toArray(children)[page];
  const isLastPage = page === React.Children.count(children) - 1;
  console.log(values)
  // next page
  const next = (values: Values) => {
    setPage(Math.min(page + 1, React.Children.count(children)));
    setValues(values);
  };

  // previous page
  const previous = () => {
    setPage(Math.max(page - 1, 0));
  };

  const handleSubmit = (values: Values) => {
    const isLastPage = page === React.Children.count(children) - 1;
    if (isLastPage) {
      return onSubmit(values);
    } else {
      next(values);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {({ handleSubmit, values }) => 
        <form onSubmit={handleSubmit}>
        <Flex flexWrap="wrap" mx={-2}>
          <ShadowBox
            maxWidth="750px"
            p="24px"
            mt="0px"
            px={['24px', '24px', '70px']}
            width={[1, 1, 2 / 3]}
          >
          {activePage}
          <div className="buttons">
            {page > 0 && (
              <button type="button" onClick={previous}>
                « Previous
              </button>
            )}
            {isLastPage ? (
              <StyledFormButton>Request</StyledFormButton>
            ) : (
              <StyledFormButton>Next</StyledFormButton>
            )
            }
          </div>
          </ShadowBox>
          </Flex>
        </form>
      }
    </Form>
  );
};

export default Wizard;
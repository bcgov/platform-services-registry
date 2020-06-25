import styled from '@emotion/styled';
import { Label as RebassLabel } from '@rebass/forms';
import { border, typography } from 'styled-system';



export const Label = styled(RebassLabel)`
  border: '1px solid #eee';
  borderRadius: 3;
  backgroundColor: '#FFFFFF';
  cursor: 'pointer';
  fontSize: 15;
  padding: '3px 10px';
  margin: 10;
  ${border};
  ${typography};
`;


export default Label;
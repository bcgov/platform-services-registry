import styled from '@emotion/styled';

export const Wrapper = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 700;
	outline: 0;
	width 80%;
  @media(min-width: 768px) {
    width: 60%;
  }
  @media(min-width: 1024px) {
    width: 40%;
  }
`;

export const Backdrop = styled.div`
	position: fixed;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	background: rgba(0, 0, 0, 0.3);
	z-index: 500;
`;

export const StyledModal = styled.div`
	z-index: 100;
	background: white;
	position: relative;
	margin: auto;
	border-radius: 8px;
`;

export const Header = styled.div`
	
	display: flex;
	justify-content: space-between;
	padding: 0.3rem;
`;

export const HeaderText = styled.div`
	align-self: center;
	color: lightgray;
`;

export const CloseButton = styled.button`
	font-size: 0.8rem;
	border: none;
	border-radius: 3px;
	margin-left: 0.5rem;
	background: none;
	:hover {
		cursor: pointer;
	}
`;

export const Content = styled.div`
	padding: 5px 20px;
	max-height: 30rem;
	overflow-x: hidden;
	overflow-y: auto;
`;

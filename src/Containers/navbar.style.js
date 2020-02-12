import styled from 'styled-components';

const navbarWrapper = styled.div`
    width: 100%;
    background-color: rgba(33, 91, 51, 0.92);
    overflow: hidden;
    height: ${props => props.navbarHeigth}px;
`;

export default navbarWrapper;
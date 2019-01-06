import { Layout } from 'antd';

const { Header } = Layout;

export default (props) => {
    return (
        <Header style={ props.style }>
            <div style={{ width: '50%'}}>
                <img alt="logo" src={props.logoImg} style={props.logoImgStyle}/>
                <img alt="logo2" src={props.logoFont} style={props.logoFontStyle} />
            </div>
        </Header>
    );
};

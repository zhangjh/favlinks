import React from 'react';
import ReactDOM from 'react-dom';
import PCHeader from './component/pcHeader.js';
import Responsive from 'react-responsive';

const Desktop = props => <Responsive {...props} minWidth={992} />;
const Tablet = props => <Responsive {...props} minWidth={768} maxWidth={991} />;
const Mobile = props => <Responsive {...props} maxWidth={767} />;

ReactDOM.render(
	<div style={{ backgroundColor: '#2b7dad' }}>
        <Desktop>
		<PCHeader
			style={{ backgroundColor: '#f8f8f8',height: 'auto',margin: '0 auto', maxWidth: '1260px'}}
			logoContainer="logoContainer"
			logoImg="https://favlink.cn/img/logo.png"
			logoImgClass="logoImg"
			titleContainer="titleContainer"
			logoTitleClass="title"
			logoSubTitleClass="subTitle"
			title="藏经阁--您的私人定制收藏夹"
			subTitle="favlink.cn"
			loginContainer="loginContainer"
			clear="clear"
			loginUser="xxxx"
		/>
        </Desktop>
        <Tablet>Tablet</Tablet>
        <Mobile>Mobile</Mobile>
	</div>,
	document.getElementById('container')
);

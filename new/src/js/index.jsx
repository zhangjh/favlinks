import React from 'react';
import ReactDOM from 'react-dom';
import Header from './component/header.js';

ReactDOM.render(
	<div style={{ backgroundColor: '#2b7dad' }}>
		<Header
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
	</div>,
	document.getElementById('container')
);

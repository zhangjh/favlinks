import React from 'react';
import { Layout,Row,Col } from 'antd';
const { Header } = Layout;

export default (props) => {
    return (
        <Header style={ props.style }>
            <Row className={props.navHeader}>
				<Col className={props.logoContainer} xs={24} sm={24} md={12} lg={12} xl={12}>
				<img alt="logo" src={props.logoImg} className={props.logoImgClass}/>
					<div className={props.titleContainer}>
						<p className={props.logoTitleClass}>{props.title}</p>
						<p className={props.logoSubTitleClass}>{props.subTitle}</p>
					</div>
				</Col>
				<Col className={props.loginContainer} xs={0} sm={0} md={12} lg={12} xl={12}>
					您好，<span id="loginUser">{props.isLogin ? props.loginUser : "游客"}</span>
					{ props.isLogin ?
						<span className="loginSpan">退出</span> :
						<span className="loginSpan">登录</span>
					}
				</Col>
                <div className={props.clear}></div>
            </Row>
        </Header>
    );
};

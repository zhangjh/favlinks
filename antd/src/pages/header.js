import { Layout } from 'antd';
import styles from './header.css';
const { Header } = Layout;

export default (props) => {
    return (
        <Header style={ props.style }>
            <div className={props.navHeader}>
                <div className={props.logoContainer}>
                    <img alt="logo" src={props.logoImg} className={props.logoImgClass}/>
                    <div className={props.titleContainer}>
                        <p className={props.logoTitleClass}>{props.title}</p>
                        <p className={props.logoSubTitleClass}>{props.subTitle}</p>
                    </div>
                </div>
                <div className={props.loginContainer}>
                    您好，<span id={styles.loginUser}>{props.isLogin ? props.loginUser : "游客"}</span>
                    { props.isLogin ? 
                        <span className={styles.loginSpan}>退出</span> :
                        <span className={styles.loginSpan}>登录</span>
                    }
                </div>
                <div className={props.clear}></div>
            </div>
        </Header>
    );
};

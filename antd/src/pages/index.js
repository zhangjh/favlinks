import Header from './header.js';
import 'antd/dist/antd.css';
import styles from './index.css';
import connect from 'dva';

export default () => {
    return (
        <div style={{ backgroundColor: '#2b7dad' }}>
            <Header
                style={{ backgroundColor: '#f8f8f8',height: 'auto',margin: '0 auto', maxWidth: '1260px'}}
                logoContainer={styles.logoContainer}
                logoImg="https://favlink.cn/img/logo.png"
                logoImgClass={styles.logoImg}
                titleContainer={styles.titleContainer}
                logoTitleClass={styles.title}
                logoSubTitleClass={styles.subTitle}
                title="藏经阁--您的私人定制收藏夹"
                subTitle="favlink.cn"
                loginContainer={styles.loginContainer}
                clear={styles.clear}
                loginUser="xxxx"
            />
        </div>
    );
};

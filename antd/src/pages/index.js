import Header from './header.js';
import connect from 'dva';

export default () => {
    return (
        <div style={{ backgroundColor: '#2b7dad' }}>
            <Header
                style={{ backgroundColor: '#f8f8f8',height: 'auto',margin: '0 auto', maxWidth: '1260px'}}
                logoImg="https://favlink.cn/img/logo.png"
                logoImgStyle={{width: '80px'}}
                logoFont="https://favlink.cn/img/logo-font.png"
                logoFontStyle={{maxWidth: '54%'}}
            />
        </div>
    );
};

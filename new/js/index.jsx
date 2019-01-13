const { Layout, Menu, Breadcrumb, Icon, Row, Col,} = antd;

const {
  Header, Content, Footer, Sider,
} = Layout;
const SubMenu = Menu.SubMenu;

class Index extends React.Component {
	state = {
		collapsed: false,
	};

	onCollapse = (collapsed) => {
		console.log(collapsed);
		this.setState({ collapsed });
	};

	render() {
		return (
			<Layout style={{ minHeight: '100vh' }}>
				<Header
					collapsible
					collapsed={this.state.collapsed}
					onCollaspe={this.onCollapse}
				>
					<Row>
						<Col span={12}>
							<div className="logo" />
						</Col>
						<Col span={12}>
							<Col span={16} />
							<Col span={8}>
								Welcome xxx!!!
							</Col>
						</Col>
					</Row>
				</Header>
				<Layout>
					<Header>notice here</Header>
					<Content></Content>
					<Footer>
						edit by zhangjihong
					</Footer>
				</Layout>
			</Layout>
		);
	}
}

ReactDOM.render(<SiderDemo />, mountNode);

import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

const { Header, Content, Footer } = Layout;
const { SubMenu } = Menu;

function App() {

  const location = useLocation();

  return (
    <Layout>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', background: 'white' }}>
        <div className="logo" />
        <Menu selectedKeys={[location.pathname]} mode="horizontal">
          <Menu.Item key="/create">
            <Link to='/create'>Create</Link>
          </Menu.Item>
          <Menu.Item key="/list">
            <Link to='/list'>Schedules</Link>
          </Menu.Item>
          <Menu.Item key="/morning">
            <Link to='/morning'>Mornin'</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content className="site-layout" style={{ padding: '0 50px', marginTop: 64 }}>
        <div className="site-layout-background" style={{ padding: 24, minHeight: 380 }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Discipline makes you free</Footer>
    </Layout>
  );
}

export default App;

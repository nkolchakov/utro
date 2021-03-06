import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import { shortenAddress, useEtherBalance, useEthers } from '@usedapp/core';
import { Badge, Button } from "antd";
import { ApiTwoTone } from '@ant-design/icons';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { getContract, getProvider } from './schedule-service';

const { Header, Content, Footer } = Layout;
const { SubMenu } = Menu;

function App() {

  const location = useLocation();

  const { activateBrowserWallet, account, deactivate } = useEthers()
  const [connected, setConnected] = useState(false);
  const [etherBalance, setEtherBalance] = useState<any>(0);

  const connBtn = <Button type="primary" shape="round" onClick={activateBrowserWallet} >Connect</Button>
  const discBtn = <Button type="ghost" shape="round" danger onClick={deactivate} >Deactivate</Button>


  useEffect(() => {
    setConnected(!!account);
    const contract = getContract();
    //@ts-ignore
    let provider = getProvider();
    let handler: any = provider.on('block', () => {
      if (!!account) {
        provider.getBalance(account)
          .then((bal: any) => {
            console.log(bal);
            const parsed: number = +ethers.utils.formatEther(bal);
            setEtherBalance(parsed.toFixed(2))
          })
      }
    })
    return () => { handler = null }
  }, [account])


  return (
    <Layout>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', background: 'white' }}>
        <div className="logo" />
        <Menu selectedKeys={[location.pathname]} mode="horizontal">
          <Menu.Item key="/">
            <Link to='/'>Create</Link>
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
        <span style={{ float: 'right' }}>
          {(!!account && connected) && <span>
            {<span>?? {etherBalance?.toString()}{' / '}</span>}
            <Badge status='success' text={shortenAddress(account!)} />
          </span>} {' '}
          {connected ? discBtn : connBtn}
        </span>
        <div
          style={{
            padding: 24, minHeight: 380,
            // display: 'flex', placeContent: 'center'
          }}>
          {!!account ?
            <Outlet /> :
            <h1>Pleae connect your wallet <ApiTwoTone /></h1>
          }
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Discipline makes you free</Footer>
    </Layout>
  );
}

export default App;

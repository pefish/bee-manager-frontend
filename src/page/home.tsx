import React from 'react';
import {inject, observer} from 'mobx-react';
import './home.css'
import {Button, Divider, Image, Input, Layout, Menu, Pagination, Table, Tag} from 'antd';
import {UserOutlined} from '@ant-design/icons';
import HomeStore from '../store/home_store';
import CommonStore from '../store/common_store';
import MyModal from "../component/my_modal";
import NodeTabContent from "./home/node_tab_content";
import ExecCommandTabContent from "./home/exec_command_tab_content";


const {Sider} = Layout;


@inject('homeStore', 'commonStore')
@observer
export default class Home extends React.Component<{
  homeStore?: HomeStore,
  commonStore?: CommonStore,
  [x: string]: any,
}, any> {

  componentDidMount() {
    this.props.homeStore!.setMediaListeners()
  }

  selectMenuContent() {
    console.log("tab", this.props.homeStore!.selectedMenu)
    if (this.props.homeStore!.selectedMenu === "node") {
      return (
        <NodeTabContent/>
      )
    } else if (this.props.homeStore!.selectedMenu === "command") {
      return (
        <ExecCommandTabContent/>
      )
    } else {
      return (
        <div className="menu-content">nothing</div>
      )
    }

  }

  render() {
    return (
      <div className="app">
        <div className="suspension" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div className="click-div" onClick={() => {
            window.location.href = "./"
          }}>
            <span>{this.props.commonStore!.websiteSimpleTitle}</span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
          }}>
            <label style={{
              marginRight: 10,
              color: "red"
            }}>{this.props.commonStore!.persistenceStore.get("jwt") ? this.props.commonStore!.persistenceStore.get("username") : ""}</label>
            <div className="click-div" onClick={() => {
              if (this.props.commonStore!.persistenceStore.get("jwt")) {
                // logout
                this.props.homeStore!.loginOrLogout()
              } else {
                // login
                this.props.homeStore!.loginModalVisible = true
              }
            }}><span>{this.props.commonStore!.persistenceStore.get("jwt") ? "??????" : "??????"}</span></div>
          </div>
        </div>
        <div className="content">
          <div className="left-space" style={{
            flex: this.props.homeStore!.isWeb ? 1 : 0
          }}></div>
          <div className="real-content">
            <div style={{
              display: "flex",
              flex: 1,
              flexDirection: "column"
            }}>
              <div className="content-header" style={{
                display: this.props.homeStore!.isWeb ? "flex" : "none"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center"
                }}>
                  <Image
                    width={46}
                    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                  />
                  <span style={{
                    color: "#009a61",
                    marginLeft: 10,
                    fontSize: 28
                  }}>{this.props.commonStore!.websiteSimpleTitle}</span>
                </div>
              </div>
              <Layout className="all-menu-content">
                <Sider
                  breakpoint="lg"
                  collapsedWidth="0"
                  onBreakpoint={broken => {
                    console.log(broken);
                  }}
                  onCollapse={(collapsed, type) => {
                    console.log(collapsed, type);
                  }}
                  theme="light"
                  style={{
                    backgroundColor: "#333",
                    color: "white"
                  }}
                >
                  <div className="logo"/>
                  <Menu theme="dark" mode="inline" defaultSelectedKeys={[this.props.homeStore!.selectedMenu]} style={{
                    backgroundColor: "#333"
                  }} onSelect={(e) => {
                    this.props.homeStore!.setSelectedMemu(e.key as string)
                  }}>
                    <Menu.Item key="node" icon={<UserOutlined/>}>
                      ????????????
                    </Menu.Item>
                    <Menu.Item key="command" icon={<UserOutlined/>}>
                      ????????????
                    </Menu.Item>
                  </Menu>
                </Sider>
                {this.selectMenuContent()}
              </Layout>
            </div>
          </div>
          <div className="right-space" style={{
            flex: this.props.homeStore!.isWeb ? 1 : 0
          }}></div>
        </div>
        <div className="footer">Copyright ?? 2020-2030 Created by PEFISH</div>

        <MyModal title={"??????"} visible={this.props.homeStore!.loginModalVisible} onCancel={() => {
          this.props.homeStore!.loginModalVisible = false
        }}>
          <Input placeholder="?????????" addonBefore="?????????" value={this.props.homeStore!.loginUsername} onChange={(e) => {
            this.props.homeStore!.loginUsername = e.target.value
          }}/>
          <Input placeholder="??????" addonBefore="??????" type={"password"} value={this.props.homeStore!.loginPassword}
                 onChange={(e) => {
                   this.props.homeStore!.loginPassword = e.target.value
                 }}/>
          <Button type={`primary`} onClick={() => {
            this.props.homeStore!.loginOrLogout()
          }} style={{
            marginTop: 10,
          }}>??????</Button>
        </MyModal>
      </div>
    );
  }
}

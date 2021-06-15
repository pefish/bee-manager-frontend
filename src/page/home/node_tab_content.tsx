
import {Divider, Pagination, Table} from "antd";
import React from "react";
import HomeStore from "../../store/home_store";
import CommonStore from "../../store/common_store";
import {inject, observer} from "mobx-react";

@inject('homeStore', 'commonStore')
@observer
export default class NodeTabContent extends React.Component
  <
    {
      homeStore ? : HomeStore,
      commonStore ? : CommonStore,
    }
    ,
    any > {

  componentDidMount() {
    this.props.homeStore?.nodeTabFetchNodes()
  }

  render() {
    return (
      <div className="menu-content">
        <Table style={{
          width: "100%",
        }} columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: text => <a>{text}</a>,
          },
          {
            title: 'Version',
            dataIndex: 'version',
            key: 'version',
          },
          {
            title: 'Url',
            dataIndex: 'url',
            key: 'url',
          },
          {
            title: 'IsAlive',
            dataIndex: 'is_alive',
            key: 'is_alive',
            render: (text, record) => {
              if (text === 1) {
                return (
                  <span>存活</span>
                )
              } else {
                return (
                  <span style={{
                    color: "red"
                  }}>异常</span>
                )
              }
            },
          },
          {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
              <span>
                {/*<a>Invite</a>*/}
                {/*<Divider type="vertical"/>*/}
                {/*<a>Delete</a>*/}
              </span>
            ),
          },
        ]} dataSource={this.props.homeStore?.nodeTabData} pagination={false}/>
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 10
        }}>
          <Pagination
            showSizeChanger={false}
            defaultPageSize={20}
            pageSize={this.props.homeStore?.nodeTabPageSize}
            onChange={(page, size) => {
              this.props.homeStore!.nodeTabPage = page
              if (size) {
                this.props.homeStore!.nodeTabPageSize = size
              }
              this.props.homeStore!.nodeTabFetchNodes()
            }}
            defaultCurrent={1}
            current={this.props.homeStore?.nodeTabPage}
            total={this.props.homeStore?.nodeTabTotal}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          />
        </div>
      </div>
    )
  }
}

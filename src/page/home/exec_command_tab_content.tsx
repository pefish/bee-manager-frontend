
import React from "react";
import HomeStore from "../../store/home_store";
import CommonStore from "../../store/common_store";
import {inject, observer} from "mobx-react";
import {Input, Select, Button} from "antd";

const { TextArea } = Input;
const { Option } = Select;

@inject('homeStore', 'commonStore')
@observer
export default class ExecCommandTabContent extends React.Component
  <
    {
      homeStore ? : HomeStore,
      commonStore ? : CommonStore,
    }
    ,
    any > {

  render() {
    return (
      <div className="menu-content">
        <div style={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 10
          }}>
            <div style={{
              marginRight: 10,
              flex: 1
            }}>
              <Select showSearch placeholder="命令" style={{
                width: "100%"
              }} onChange={(value) => {
                this.props.homeStore!.execCommandTabSelectedCommand = value.toString()
              }}>
                {
                  (() => {
                    const results: any = []
                    for (const [key, execCommandTabCommand] of Object.entries(this.props.homeStore!.execCommandTabCommands)) {
                      results.push(
                        <Option value={key}>{execCommandTabCommand.text}</Option>
                      )
                    }
                    return results
                  })()
                }
              </Select>
            </div>
            <Button type={`primary`} onClick={() => {
              this.props.homeStore!.execCommandTabExec()
            }}>执行</Button>
          </div>
          {
            this.props.homeStore!.execCommandTabCommands[this.props.homeStore!.execCommandTabSelectedCommand]
            ?
            (
              <div style={{
                color: "red",
                marginBottom: 10,
                fontSize: 16
              }}>
                <label>{this.props.homeStore!.execCommandTabCommands[this.props.homeStore!.execCommandTabSelectedCommand].tip}</label>
              </div>
            )
            :
            null
          }
          <TextArea disabled={true} style={{
            height: "100%",
            backgroundColor: "black",
            color: "white",
            flex: 1
          }} rows={4} value={this.props.homeStore!.execCommandTabResult} />
        </div>
      </div>
    )
  }
}

import { observable } from 'mobx';
import { withGlobalLoading, wrapPromiseWithErrorTip, withLogout } from '../util/decorator';
import HttpRequestUtil from "@pefish/js-util-httprequest"
import config from "../config/index"
import {commonStore} from "./init";
import {StringUtil} from "@pefish/js-node-assist"

const isWebMediaString = "(min-width: 996px)"
export default class HomeStore {

  @observable
  public counter = 0;

  private isWebMatchMedia = window.matchMedia(isWebMediaString)
  @observable public isWeb = this.isWebMatchMedia.matches
  @observable public selectedMenu: string = "node"

  @observable public loginModalVisible: boolean = false
  @observable public loginUsername: string = ""
  @observable public loginPassword: string = ""


  @observable public nodeTabData: any[] = []
  @observable public nodeTabPageSize: number = 20
  @observable public nodeTabPage: number = 1
  @observable public nodeTabTotal: number = 0


  @observable public execCommandTabResult: string = ``
  @observable public execCommandTabSelectedCommand: string = ""
  public execCommandTabCommands: {[key: string]: {
      text: string,
      tip: string,
      params: string[],
    }} = {
    "list_all_ticket": {
      text: "查询所有节点获取的所有票",
      tip: "不要过于频繁执行此命令，否则影响节点出票",
      params: []
    }
  }


  public setMediaListeners () {
    this.isWebMatchMedia.addListener(e => {
      this.isWeb = e.matches
    });
  }

  public setSelectedMemu (key: string) {
    this.selectedMenu = key
  }

  @wrapPromiseWithErrorTip()
  @withGlobalLoading()
  public async loginOrLogout (): Promise<any> {
    if (commonStore.persistenceStore.get("jwt")) {
      // logout
      commonStore.persistenceStore.remove("jwt")
      commonStore.persistenceStore.remove("username")
      return null
    } else {
      // login
      if (!config["urls"][this.loginUsername]) {
        throw new Error("用户名或密码错误")
      }
      const result = await HttpRequestUtil.post(config["urls"][this.loginUsername] + "/login", {
        params: {
          "username": this.loginUsername,
          "password": this.loginPassword
        }
      })
      if (result.code !== 0) {
        throw new Error(result.msg)
      }
      this.loginModalVisible = false
      commonStore.persistenceStore.set("jwt", result.data.token)
      commonStore.persistenceStore.set("username", this.loginUsername)
      // if (this.selectedMenu === "node") {
      //   await this.nodeTabFetchNodes()
      // }
      return null
    }

  }

  @wrapPromiseWithErrorTip()
  @withLogout("loginOrLogout")
  @withGlobalLoading()
  public async nodeTabFetchNodes (): Promise<any> {
    if (!commonStore.persistenceStore.get("jwt")) {
      throw new Error("请先登录")
    }
    const result = await HttpRequestUtil.get(config["urls"][commonStore.persistenceStore.get("username")] + "/node", {
      params: {
        "page": this.nodeTabPage,
        "size": this.nodeTabPageSize
      },
      headers: {
        "jwt": commonStore.persistenceStore.get("jwt")
      }
    })
    if (result.code !== 0) {
      throw new Error(result.msg)
    }
    this.nodeTabData = result.data.datas
    this.nodeTabTotal = result.data.total
  }

  @wrapPromiseWithErrorTip()
  @withLogout("loginOrLogout")
  @withGlobalLoading()
  public async execCommandTabExec (): Promise<any> {
    if (this.execCommandTabSelectedCommand === "list_all_ticket") {
      let page = 1
      while (true) {
        // 拉取节点
        const result = await HttpRequestUtil.get(config["urls"][commonStore.persistenceStore.get("username")] + "/node", {
          params: {
            "page": page,
            "size": 20
          },
          headers: {
            "jwt": commonStore.persistenceStore.get("jwt")
          }
        })
        if (result.code !== 0) {
          throw new Error(result.msg)
        }
        const nodes = result.data.datas
        if (nodes.length === 0) {
          break
        }
        // 循环每个节点，获取每个节点的票
        for (const node of nodes) {
          if (this.execCommandTabResult) {
            this.execCommandTabResult += "\n"
          }
          this.execCommandTabResult += `${node.name}:`
          const result = await HttpRequestUtil.post(config["urls"][commonStore.persistenceStore.get("username")] + "/request", {
            params: {
              "url": node.url,
              "path": "/chequebook/cheque",
              "method": "GET"
            },
            headers: {
              "jwt": commonStore.persistenceStore.get("jwt")
            }
          })
          if (result.code !== 0) {
            this.execCommandTabResult += ` ${result.msg}`
            continue
          }
          if (result.data.lastcheques && result.data.lastcheques.length > 0) {
            for (const lastcheque of result.data.lastcheques) {
              if (!lastcheque.lastreceived) {
                continue
              }
              this.execCommandTabResult += `\n\t${lastcheque.peer} ${StringUtil.start(lastcheque.lastreceived.payout).unShiftedBy(16).remainDecimal(8).end()}`
              // 查询是否已经提取
              const result = await HttpRequestUtil.post(config["urls"][commonStore.persistenceStore.get("username")] + "/request", {
                params: {
                  "url": node.url,
                  "path": "/chequebook/cashout/" + lastcheque.peer,
                  "method": "GET"
                },
                headers: {
                  "jwt": commonStore.persistenceStore.get("jwt")
                }
              })
              if (result.code !== 0) {
                this.execCommandTabResult += ` ${result.msg}`
                continue
              }
              if (result.data.uncashedAmount === 0) {
                this.execCommandTabResult += ` 已兑现`
              }
              if (result.data.uncashedAmount < 0) {
                this.execCommandTabResult += ` 废票`
              }
              document.getElementById("execCommandTabResult")!.scrollTop = document.getElementById("execCommandTabResult")!.scrollHeight

            }
          }
        }
        page++
      }
    } else {
      throw new Error("错误的命令")
    }
  }
}

import { observable } from 'mobx';
import CommonStore from './common_store';
import { withGlobalLoading, wrapPromise } from '../util/decorator';
import HttpRequestUtil from "@pefish/js-util-httprequest"
import { ReturnType } from '../util/type';
import config from "../config/index"

const isWebMediaString = "(min-width: 996px)"
export default class HomeStore {

  private commonStore: CommonStore
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


  constructor (commonStore: CommonStore) {
    this.commonStore = commonStore
  }

  public setMediaListeners () {
    this.isWebMatchMedia.addListener(e => {
      this.isWeb = e.matches
    });
  }

  public setSelectedMemu (key: string) {
    this.selectedMenu = key
  }

  @withGlobalLoading()
  @wrapPromise()
  public async loginOrLogout (): Promise<any> {
    if (this.commonStore.persistenceStore.get("jwt")) {
      // logout
      this.commonStore.persistenceStore.remove("jwt")
      this.commonStore.persistenceStore.remove("username")
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
      this.commonStore.persistenceStore.set("jwt", result.data.token)
      this.commonStore.persistenceStore.set("username", this.loginUsername)
      // if (this.selectedMenu === "node") {
      //   await this.nodeTabFetchNodes()
      // }
      return null
    }

  }

  @withGlobalLoading()
  @wrapPromise()
  public async nodeTabFetchNodes (): Promise<any> {
    if (!this.commonStore.persistenceStore.get("jwt")) {
      throw new Error("请先登录")
    }
    const result = await HttpRequestUtil.get(config["urls"][this.commonStore.persistenceStore.get("username")] + "/node", {
      params: {
        "page": this.nodeTabPage,
        "size": this.nodeTabPageSize
      },
      headers: {
        "jwt": this.commonStore.persistenceStore.get("jwt")
      }
    })
    if (result.code !== 0) {
      throw new Error(result.msg)
    }
    this.nodeTabData = result.data.datas
    this.nodeTabTotal = result.data.total
  }
}

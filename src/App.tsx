import { Component } from "react"
import connection from "./Hub/Hub"
import operations from "./Operations/Operations"
import { Button, FormControl, Modal } from "react-bootstrap"
//@ts-ignore
import { v4 as uuidv4 } from "uuid";
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

interface AppTypes {
  loginPrompt: boolean
  userName: string
  eventType: string
  messages: Array<any>
  messageInput: string
  remoteKey: string
  popUpPrompt: boolean
  popUpUrl: string
  popUpRemoteKey: string
}

class App extends Component<{}, AppTypes> {

  constructor(props: any) {
    super(props)
    this.state = {
      loginPrompt: true,
      userName: "",
      eventType: "chatMsg",
      messages: [],
      messageInput: "",
      remoteKey: "",
      popUpPrompt: false,
      popUpUrl: "",
      popUpRemoteKey: ""
    }
  }

  /*
  Connection is imported from ./Hub/Hub so we can use it in our app,
  “newMessage" is the Azure function we are listening to, 
  “this.signalRIn" will receive the response from the Azure function.
  All clients connected will receive the same message.
  */

  componentDidMount() {
    connection.on("newMessage", this.signalRIn)
  }
  /*
  Based on what message we get back we can decide what functions to call in our client,
  you can also set up multiple functions on the same service in Azure. 
  Say you have (in Azure) an “openPopUp” function.  You would then have somewhere in your client
  connection.on(“openPopUp”, this.someOtherFunction). In this particular case its the same function 
  so I dont really see the point.
   */

  signalRIn = (input: any) => {
    if (input.type === "chatMsg") {
      this.sendChat({ userName: input.userName, message: input.message })
    }
    if (input.type === "openPopUp") {
      this.openPopUp(input.remoteKey, input.url)
    }
    console.log("Message from SignalR: ", input)
  }

  setEventType = (type: string) => {
    this.setState({ eventType: type })
  }

  handleChange = (event: any) => {
    event.preventDefault()
    if (this.state.eventType === "chatMsg") {
      this.setState({ messageInput: event.target.value })
    }
    if (this.state.eventType === "userName") {
      this.setState({ userName: event.target.value })
    }
    if (this.state.eventType === "remoteKey") {
      this.setState({ remoteKey: event.target.value })
    }
    if (this.state.eventType === "popUpRemoteKey") {
      this.setState({ popUpRemoteKey: event.target.value })
    }
    if (this.state.eventType === "popUpUrl") {
      this.setState({ popUpUrl: event.target.value })
    }
  }

  anonymousLogin = () => {
    this.setState({ userName: "Anonymous", remoteKey: uuidv4(), loginPrompt: false })
  }

  login = () => {
    this.setState({ loginPrompt: false })
  }

  sendChat = (message: any) => {
    let temp = this.state.messages
    temp.push(message)
    this.setState({ messages: temp, messageInput: "" })
  }

  togglePopUp = () => {
    if (this.state.popUpPrompt) {
      this.setState({ popUpPrompt: false })

    } else {
      this.setState({ popUpPrompt: true })
    }
  }

  openPopUp = (remoteKey: string, url: string) => {
    if (this.state.remoteKey === remoteKey) {
      window.open(url);
    } else {
      this.togglePopUp()
    }
  }

  render() {

    return (
      <div className="App">
        {this.state.loginPrompt &&
          <Modal
            show={true}
            backdrop="static"
            keyboard={true}
          >
            <Modal.Header>
              <div className="LoginModalHeader">
                <p>Welcome to the ELM SignalR Demo!</p>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="LoginModalUserNameWrapper">
                <p>Username</p>
                <FormControl
                  id="login-input"
                  onClick={() => this.setEventType("userName")}
                  onChange={this.handleChange}
                />
              </div>
              <div className="LoginModalRemoteKeyWrapper">
                <p>Remote Key</p>
                <FormControl
                  id="remote-key-input"
                  onClick={() => this.setEventType("remoteKey")}
                  onChange={this.handleChange}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="LoginModalFooter">
                {this.state.userName === "" && this.state.remoteKey === "" && <Button variant="secondary" id="anon-log-in-btn" onClick={this.anonymousLogin}>Anonymous Log In</Button>}
                {this.state.userName !== "" && this.state.remoteKey !== "" && <Button id="log-in-btn" onClick={this.login}>Log In</Button>}
              </div>
            </Modal.Footer>
          </Modal>}
        {this.state.popUpPrompt && <Modal
          show={true}
          backdrop="static"
          keyboard={true}
        >
          <Modal.Header>
            <div className="LoginModalHeader">
              <p>Trigger a popup on a connected client</p>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="PopUpUrlWrapper">
              <p>URL</p>
              <FormControl
                id="pop-up-url-input"
                onClick={() => this.setEventType("popUpUrl")}
                onChange={this.handleChange}
              />
            </div>
            <div className="PopUpRemoteKeyWrapper">
              <p>Remote Key</p>
              <FormControl
                id="pop-up-remote-key"
                onClick={() => this.setEventType("popUpRemoteKey")}
                onChange={this.handleChange}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="PopUpModalFooter">
              {this.state.popUpRemoteKey !== "" && this.state.popUpUrl !== "" && <Button id="pop-up-send-btn" onClick={() => operations.sendPopUp(this.state.popUpRemoteKey, this.state.popUpUrl)}>Send</Button>}
              <Button id="pop-up-quit-btn" variant="secondary" onClick={this.togglePopUp}>Cancel</Button>
            </div>
          </Modal.Footer>
        </Modal>}
        {this.state.userName !== "" && this.state.remoteKey !== "" && <div className="UserInfo">
          <p>Username: {this.state.userName}</p>
          <p>Remote Key: {this.state.remoteKey}</p>
        </div>}
        <div className="ChatMessageWrapper">
          <p id="messages-header">Chat</p>
          <div className="ChatMessageInputWrapper">
            <FormControl
              id="message-input"
              onClick={() => this.setEventType("chatMsg")}
              onChange={this.handleChange}
              value={this.state.messageInput}
            />
            {this.state.messageInput !== "" &&
              <Button id="chat-message-send-btn" onClick={() => operations.chatMsg(this.state.userName, this.state.messageInput)}><div id="chat-message-send-btn-content-wrapper"><p>Send</p><span className="material-icons">send</span></div></Button>}
          </div>
          {this.state.messages.length > 0 && this.state.messages.map((message: any, index: number) =>
            <div className="Message" key={`message-${index}`}>
              <p id="message-username">{message.userName}:</p>
              <p id="message-text">{message.message}</p>
            </div>
          )}
        </div>
        <Button variant="secondary" id="open-page-btn" onClick={() => this.togglePopUp()}>Trigger Popup</Button>
      </div>
    )
  }
}

export default App;
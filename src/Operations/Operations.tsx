import axios from "axios";
const operations: any = {
    chatMsg: (userName: string, message: string) => {
        operations.signalROut(
            {
                type: "chatMsg",
                userName: userName,
                message: message
            }
        )
    },
    sendPopUp: (remoteKey: string, url: string) => {
        operations.signalROut(
            {
                type: "openPopUp",
                remoteKey: remoteKey,
                url: url
            }
        )
    },
    signalROut: (input: object) => {
        axios.post("https://elmsigr-fn.azurewebsites.net/api/messages", input)
            .then((resp: any) => resp.data);
    }
}
export default operations
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
    },//You will probably have to allow popups in your browser for this to work.
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

/*
This is (in my opinion a simpler way to handle our POST’s to our function in Azure.
From the client we import “operations” and we can call operations.chatMsg(userName, message).
The chatMsg function then calls...

***operations.signalROut({type: "chatMsg", userName: userName, message: message })*** 

Notice that the “type” is how we are deciphering what function we call in App.tsx when receive a SignalR message
*/

export default operations
const signalR = require("@microsoft/signalr");
const connection = new signalR.HubConnectionBuilder()
.withUrl("https://elmsigr-fn.azurewebsites.net/api")
.withAutomaticReconnect()
.configureLogging(signalR.LogLevel.Information)
.build()
connection.onclose(() => console.log("disconnected signalR"))
connection.start()
.then(() => console.log("signalR connected"))
.catch(console.error)
export default connection
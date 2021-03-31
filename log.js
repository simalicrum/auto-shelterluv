resStatusToConsole = (method, res) => {
  console.log(new Date().toLocaleString() + " " + method + " " + res.url() + " " + res.status() + res.statusText());
}

writeToConsole = (action, message) => {
  console.log(new Date().toLocaleString() + " " + action + " " + message);
}

function doGet(e) {
  if (e.queryString != "") {
    PropertiesService.getUserProperties().setProperty("data", "Create a task!Ĭ"+new Date()+"Ĭ"+new Date()+"ĬpriorityĬ0Ĭhttps://tues.techŁĐhttps://classroom.google.com/ĬClassroomŁhttps://aps.elmhurst205.org/guardian/home.htmlĬPowerschoolŁĐ1")
    return HtmlService.createTemplateFromFile('Setup')
      .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setTitle("Setup").setFaviconUrl("https://github.com/Tuestech/images/raw/main/Setup%20Favicon.png");
  }
  return HtmlService.createTemplateFromFile('Index')
      .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setTitle("Hey, you aren't supposed to be here!")
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
function getData() {
  return PropertiesService.getUserProperties().getProperty("data")
}
function setData(data) {
  PropertiesService.getUserProperties().setProperty("data", data)
  return 1
}

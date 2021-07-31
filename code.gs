function doGet() {
  PropertiesService.getUserProperties().setProperty("data", "name1{item}6/7/2021{item}6/10/2021{item}priority{item}40{item}https://www.google.com{list}name2{item}6/9/2021{item}6/11/2021{item}priority{item}80{item}https://www.google.com{list}name3{item}6/9/2021{item}7/17/2021{item}priority{item}80{item}https://www.google.com{list}{divider}https://www.google.com{item}googleasdfasdfasdf{list}{divider}https://www.google.com{item}googleasdfasdfasdf")
  return HtmlService.createTemplateFromFile('Index')
      .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setTitle("Setup").setFaviconUrl("https://github.com/Tuestech/images/raw/main/Setup%20Favicon.png");
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

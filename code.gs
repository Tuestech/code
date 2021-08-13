function doGet() {
  // PropertiesService.getUserProperties().setProperty("data", "name1{item}8/1/2021{item}8/5/2021{item}priority{item}40{item}https://www.google.com{list}name2{item}8/4/2021{item}8/11/2021{item}priority{item}80{item}https://www.google.com{list}name3{item}8/3/2021{item}8/7/2021{item}priority{item}80{item}https://www.google.com{list}{divider}https://classroom.google.com/{item}Classroom{list}https://aps.elmhurst205.org/guardian/home.html{item}Powerschool{list}google.com{item}Google{list}{divider}1")
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

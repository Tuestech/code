// License Info
console.log(`
Tuesday - Work management tool for students, by students
Copyright (c) 2022 Jeffrey Lu & Joe Byrne
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License along with this program. If not, see https:\/\/www.gnu.org\/licenses\/.
`)
// ----------

// Mobile Detection
mobile_mode = screen.availWidth <= 600
// ----------

// Updates
let latest_get = new Date()
let latest_date = new Date()

let previous_objects = null

function reloadWhenOnline() {
	let xhr = null;
	const url = "https://tues.tech/blank/";
	if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	}
	else if (window.ActiveXObject) {
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.setRequestHeader('X-CSRF-Token', csrftoken);

	setTimeout(function() {
    if (xhr.status == 200) {
      window.location.replace("https://tues.tech/app");
    }
  }, 1000)

	xhr.send();
}

setInterval(function() {
	if (previous_objects == null) {
		previous_objects = [...objects]
	}
	
	if (encodeAll(previous_objects) != encodeAll(objects)) {
		latest_date = new Date()
	}
	previous_objects = objects
	
	if (daysBetween(latest_get, new Date()) != 0) {
		if (document.visibilityState != "visible" && navigator.onLine) {
			reloadWhenOnline()
		} else {
			if (page == "dash") {
				updateDashboard()
			} else if (page == "tasks") {
				updateTasks(false)
			}
			latest_get = new Date()
		}
	}
}, 1000*60)
// ----------

// Remove misbehaving extensions
window.addEventListener('load', function () {
  let idots = document.getElementsByTagName("html")[0].children
	for (var i = 0; i < idots.length; i++) {
		if (i > 1) {
			idots[i].setAttribute("style", "display: none;")
		}
	}
})
// ----------

// Get user ID
const uid = document.getElementById("uid").innerText
// ----------

// CSRF
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
// ----------

// Settings
var scoreType = 0
// ----------

// Favicon website pairs
var imagePairs = [
	["classroom.google.com", "/static/Images/google-classroom.svg"],
	["aps.elmhurst205.org", "/static/Images/ps_logo_lg.png"],
	["docs.google.com/document", "/static/Images/Docs_Logo.png"],
	["docs.google.com/spreadsheets", "/static/Images/Sheets_Logo.png"],
	["docs.google.com/presentation", "/static/Images/Slides_Logo.png"]
]
// ----------

// Array
Array.prototype.remove = function(index) {
	if (this.length-1 == index) {
		this.pop()
	} else {
		var back = this.slice(0, index)
		var front = this.slice(index+1)
		return back.concat(front)
	}
	return this
}
// ----------

// Pagination
var page = "dash"
// ----------

// Data Management
var data = null
var objects = []
var sorted = null
var linkdata = "a"

function httpGetAsync(theUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.send(null);
}

class Task {
	constructor(name="", start=new Date(), due=new Date(), classq="", priority=-999, progress=0, link="") {
		this.name = name;
		this.start = start;
		this.due = due;
		this.class = classq;
		this.priority = priority;
		this.progress = progress;
		this.link = link;
	}
	fromArray(array) {
		this.name = array[0]
		this.start = array[1]
		this.due = array[2]
		this.priority = array[3]
		this.progress = array[4]
		this.link = array[5]
		this.class = array[6]
		return this
	}
	toArray() {
		return [this.name, this.start, this.due, this.priority, this.progress, this.link, this.class]
	}
}

function safeString(string) {
	string = string.replaceAll('>', '&gt')
	string = string.replaceAll('<', '&lt')
	string = string.replaceAll('javascript:', '')
	string = string.replaceAll('\\', '&#92')
	return string
}

function encrypt(input) {
	var output = ""
	var row;
	for (row of input) {
		var item;
		for (item of row) {
			output = output + item + "<item>"
		}
		output = output + "<list>"
	}
	return output
}

function decrypt(input) {
	if (input == null) {
		return null;
	}
	var output = []
	var taskout = []
	var linkout = []
	input = decodeURIComponent(input)
	var temp = input.split("<data>")
	scoreType = temp[2]
	var linkdata;
	if (typeof temp[1] === "undefined") {
		linkdata = null;
	} else {
		var linkdata = temp[1].split("<list>")
		for (row of linkdata) {
			linkout.push(0)
			linkout[linkout.length - 1] = clean(row.split("<item>",2))
		}
	}
	var taskdata = temp[0].split("<list>")
	var row;
	for (row of taskdata) {
		taskout.push(0)
		taskout[taskout.length - 1] = clean(row.split("<item>",6))
	}
	output = [clean(taskout), clean(linkout)]
	if (clean(output)==[]) {
		return [[["Create a new task", new Date(), new Date(), 5, 50, "link.com"]]]
	}
	return clean(output)
}

function clean(input) {
	var output = []
	var item;
	for (item of input) {
		if ((item != "")&&(item != [])&&(item != null)&&(item != [,])) {
			if (isNaN(item.toString())) {
				output.push(item)
			} else {
				output.push(parseInt(item))
			}
		}
	}
	return output
}

function formatLink(link) {
	if (link.substring(0, 8) != "https://") {
		if (link.substring(0, 7) != "http://") {
			return "https://"+link;
		}
	}
	return link;
}

function encodeAll(obj_arr) {
	let arrayData = []
	for (var i = 0; i < obj_arr.length; i++) {
		arrayData.push(obj_arr[i].toArray())
	}
	let encoded = encrypt(arrayData)+"<data>"+encrypt(linkdata)+"<data>"+scoreType
	encoded = encoded.replaceAll("&", "{amp}")
	return encoded
}

function setData() {
	let xhr = null;
	let encoded = encodeAll(objects)
	const url = "https://tues.tech/editdata/";
	if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	}
	else if (window.ActiveXObject) {
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.setRequestHeader('X-CSRF-Token', csrftoken);
	xhr.send("uid="+uid+"&data="+encoded+"&date="+latest_date);
}

function setScores() {
	var task;
	for (task of objects) {
		task["priority"] = score(task)
	}
}

function sortData() {
	setScores()
	var output = [...objects]
	output.sort((a, b) => b["priority"] - a["priority"])
	sorted = output
	return output
}

function startup() {
	let value = document.getElementById("data").innerText
	var decrypted = decrypt(value)
	let temp = decrypted[0]
	data = decrypted[0]
	for (array of temp) {
		let task = new Task()
		task.fromArray(array)
		objects.push(task)
	}
	linkdata = decrypted[1]
	showPage()
	document.getElementById("loading").style.opacity = 0;
	setTimeout(function(){document.getElementById("loading").style.zIndex = -999}, 1500);
}
// ----------

// Pages
function hideAll() {
	document.getElementById("dash body").setAttribute("style", "display: none")
	document.getElementById("tasks body").setAttribute("style", "display: none")
	document.getElementById("timer body").setAttribute("style", "display: none")
	document.getElementById("settings body").setAttribute("style", "display: none")
}
function showPage() {
	hideAll()
	if (page == "dash") {
		document.getElementById("dash body").setAttribute("style", "display: grid")
		updateDashboard()
	} else if (page == "tasks") {
		document.getElementById("tasks body").setAttribute("style", "display: grid")
		updateTasks()
	} else if (page == "settings") {
		document.getElementById("settings body").setAttribute("style", "display: grid")
		updateSettings()
	} else if (page == "timer") {
		document.getElementById("timer body").setAttribute("style", "display: grid")
	}
}
function setPage(name) {
	page = name
	showPage()
}
// ----------

// Dates
function getDate() {
	var today = clearDate(new Date())
	var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	var day = days[today.getDay()]
	var year = today.getFullYear()
	var month = today.getMonth()
	var date = today.getDate()
	return [day, month, date, year]
}
function clearDate(date) {
	var output = date
	output.setMilliseconds(0)
	output.setSeconds(0)
	output.setMinutes(0)
	output.setHours(0)
	return output
}
function daysBetween(datea, dateb) {
	var datea = clearDate(datea).valueOf()
	var dateb = clearDate(dateb).valueOf()
	return Math.floor((datea-dateb)/86400000)
}
function isBetween(date, datea, dateb) {
	if ((daysBetween(date, datea)>=0)&&(daysBetween(dateb, date)>=0)) {
		return true
	} else {
		return false
	}
}
// ----------

// Updates
var needUpdate = false
var forceReady = true
var forceRequest = false
var updateCycle = setInterval(update, 10000)
function update() {
	console.log("Update Cycle")
	if (needUpdate) {
		setData()
		needUpdate = false
		forceReady = false
		setTimeout(forceCheck, 100)
	}
}
function forceCheck() {
	if (forceRequest) {
		setData()
		forceRequest = false
	}
	forceReady = true
}
function forceUpdate() {
	if (forceReady) {
		setData()
		forceReady = false
		setTimeout(forceReady = true, 100)
	} else {
		forceRequest = true
	}
}
function unload() {
	console.log("Page Closed")
	if (needUpdate) {
		console.log("Update required")
		setData()
	}
	console.log("Unloaded")
}
// ----------

// Calculation
function score(task) {
	if (task["progress"] == 100) {
		return -9999999999
	}
	// Set coefficient and exponent
	var coef = "a"
	var exp = "a"
	switch (scoreType) {
		case "0":
			coef = 100
			exp = 0.5
			break
		case "1":
			coef = 1
			exp = 1
			break
		case "2":
			coef = 5179.47
			exp = 0.35
			break
	}

	// Progress Deviation
	var prog = daysBetween(new Date(), new Date(task["start"]))/daysBetween(new Date(task["due"]), new Date(task["start"]))
	if (daysBetween(new Date(task["due"]), new Date(task["start"])) == 0) {
		if (daysBetween(new Date(), new Date(task["start"])) >= 0) {
			prog = 100
		} else {
			prog = 0
		}
	}
	prog = prog * 100
	var expected;
	if (prog < 0) {
		expected = -100
	} else {
		expected = (coef*prog)**exp
	}

	// Urgency value
	var daysLeft = daysBetween(new Date(task["due"]), new Date())
	var urgency = 0
	if (daysLeft <= 0) {
		urgency = 150
	} else {
		urgency = 100/daysLeft
	}

	return expected - task["progress"] + urgency
}
// ----------

// Dashboard
function updateDashboard() {
	sortData()
	setToday()
	setTimeline()
	setLinks()
	fade("today", 0, 1)
	fade("timeline", 100, 1)
	fade("links", 200, 1)
	page = "dash"
}
function fade(id, delay, length) {
	document.getElementById(id).style.animation="0s hidden forwards"
	setTimeout(function() {document.getElementById(id).style.animation=length+"s fade-in backwards"}, delay)
	setTimeout(function() {document.getElementById(id).style.animation="idle"}, (length*1000)+delay)
}
function openTasks() {
	setPage('tasks');
}
function setToday() {
	var output = ""
	var date = getDate()
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	var colors = ["#E87070", "#FFD450", "#D9D9D9"] // [red, yellow, gray]
	document.getElementById("date").innerText = date[0] + ", " + months[date[1]] + " " + date[2]
	for (var i = 0; i<sorted.length; i++) {
		var task = sorted[i]
		var color;
		if (task["progress"] != 100) {
			output = output + "<div><input class = 'scheck hidden' type='checkbox' id = 'todaybutton" + i + "' onchange = 'todayButton("+ i +")'><label for = 'todaybutton" + i + "'></label></div>"
		} else  {
			output = output + "<div><input class = 'scheck hidden' type='checkbox' id = 'todaybutton" + i + "'  onchange = 'todayButton("+ i +")' checked><label for = 'todaybutton" + i + "'></label></div>"
		}
		if (task["progress"] <= 40) {
			color = colors[0]
		} else if (task["progress"] < 100) {
			color = colors[1]
		} else {
			color = colors[2]
		}
		var link;
		if (typeof task["link"] == 'undefined' || task["link"] == "undefined") {
			link = "#";
			target = "_self"
		} else {
			link = formatLink(task["link"])
			var target = "_blank"
			if (task["link"] == "https://tues.tech") {
				link = "javascript: openTasks();"
				target = "_self"
			}
		}
		output = output + "<div id = 'task-name' style='background-color:" + color +"'><a href='" + link + "' target='"+target+"'>" + task["name"] + "</a></div>"
	}
	if (output == "") {
		output = "<div><input class = 'scheck hidden' type='checkbox' id = 'todaybutton" + 0 + "' onchange = 'todayButton("+ 0 +")'><label for = 'todaybutton" + 0 + "'>???</label></div>"
		output += "<div id = 'task-name'><a href='" + "tues.tech" + "' target='_blank'>" + "Example task" + "</a><div style='background-color: " + colors[2] + ";'></div></div>"
	}
	document.getElementById("list").innerHTML = output
}
function todayButton(index) {
	var checked = document.getElementById("todaybutton"+index).checked
	if (checked) {
		sorted[index]["progress"] = 100
	} else {
		sorted[index]["progress"] = 0
	}
	needUpdate = true
	sortData()
	setToday()
	setTimeline()
}
function setTimeline() {
	var output = ""
	var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	var today = new Date()
	var index = today.getDay()
	for (var i = 0; i<7; i++) {
		document.getElementById("d"+i).innerText = days[index+i]
	}
	for (var i = 0; i<sorted.length; i++) {
		var task = sorted[i]
		var line = "<div class= 'timeline-container' style=\"grid-template-areas: '"
		var day = clearDate(new Date())
		var activated = false
		var overdue = false
		var checkday = clearDate(new Date())
		checkday.setDate(day.getDate()-1)
		var left = isBetween(checkday, new Date(task["start"]), new Date(task["due"]))
		checkday = clearDate(new Date())
		checkday.setDate(day.getDate()+8)
		var right = isBetween(checkday, new Date(task["start"]), new Date(task["due"]))
		for (var j = 0; j<7; j++) {
			if ((daysBetween(new Date(task["due"]), new Date()) < 0) && (task["progress"] != 100)) {
				line = line + "active m m m m m m"
				overdue = true
				break
			}
			if (isBetween(day, new Date(task["start"]), new Date(task["due"]))) {
				line = line + "active "
				activated = true
			} else if (activated) {
				line = line + "m "
			} else {
				line = line + "n "
			}
			day.setDate(day.getDate() + 1)
		}
		line = line + "';\"><div class='timeline-line"
		if (right) {
			line = line + " right-over"
		}
		if (left) {
			line = line + " left-over"
		}
		if (!activated && task["progress"] != 100) {
			line = line + " overdue"
		}
		line = line + "'><p>"+task["name"]+"</p></div></div>"
		if (activated || overdue) {
			output = output + line
		}
	}
	if (output == "") {
		output = "<p id='alldone'>All done!</p>"
	}
	document.getElementById("timeline-lines").innerHTML = output;
}
function setLinks() {
	var output = ""
	function generate(name, link) {
		var image = "/static/Images/Google Web Icon.png"
		var pair
		for (pair of imagePairs) {
			var pairLink = pair[0]
			if (link.includes(pairLink)) {
				image = pair[1]
				break
			}
		}
		return "<a href='" + link + "' target='_blank'><div><img src='" + image + "'><p>" + name + "</p></div></a>"
	}
	for (var i=0; i<linkdata.length; i++) {
		output = output + generate(linkdata[i][1], linkdata[i][0])
	}
	document.getElementById("links").innerHTML = output
}
// ----------

// Tasks
function updateTasks(fadeTasks=true) {
	var output = ""
	var newButton = "<img id='new-button' src='/static/Images/New Button.png' class='new-button' onclick='newTask()'>"
	var taskColors = ["#E87070", "#FFD450", "#67E690"] // Red, yellow, green
	for (var i=0; i<objects.length; i++) {
		var color
		task = objects[i]
		days = daysBetween(clearDate(new Date(task["due"])), clearDate(new Date()))
		dayString = days + " days left"
		if (task["progress"] == 100) {
			dayString = "Done!"
		} else if (days == 1) {
			dayString = days + " day left"
		} else if (days == 0) {
			dayString = "Due today!"
		} else if (days < 0) {
			dayString = "Overdue!"
		}
		if (task["progress"] == 100) {
			color = taskColors[2]
		} else if (days <= 1) {
			color = taskColors[0]
		} else if (days <= 5) {
			color = taskColors[1]
		} else {
			color = taskColors[2]
		}
		output = output + "<div id='task-item-"+i+"' class='item'><div class='task'><a>"+task["name"]+"</a><div class='time' style='background-color: "+color+";'>"+dayString+"</div><input onchange='progressChange("+i+")' onwheel='scrollslide(event, "+i+")' type='range' min='1' max='100' value='"+task["progress"]+"' class='slider' id='progress-slider"+i+"'></div><img onclick='editButton("+i+")' src='/static/Images/New_Edit_Button.png' class='task-edit'><img onclick='deleteTask("+i+")' src='/static/Images/New_Delete_Button.png' class='task-delete'></div>"
	}
	document.getElementById("tasks-items").innerHTML = output + newButton
	if (fadeTasks) {
		for (var i = 0; i < objects.length; i++) {
			fade("task-item-"+i, 50*i, 0.5)
		}
		fade("new-button", objects.length * 50, 0.5)
	}
}
function newTask() {
	document.getElementById("name-input").value = ""
	document.getElementById("start-input").valueAsDate = new Date()
	document.getElementById("due-input").valueAsDate = new Date()
	document.getElementById("link-input").value = ""

	document.getElementById("edit-overlay").setAttribute("style", "display: grid;")
	document.getElementById("ok").setAttribute("onclick", "okButton("+objects.length+")")
	document.getElementById("ok").onclick = function() {
		okButton(objects.length);
	}
}
function editButton(index) {
	// Set edit panel values to existing values in data
	document.getElementById("name-input").value = objects[index]["name"]
	document.getElementById("start-input").valueAsDate = new Date(objects[index]["start"])
	document.getElementById("due-input").valueAsDate = new Date(objects[index]["due"])
	document.getElementById("link-input").value = objects[index]["link"]
	if (document.getElementById("link-input").value == "undefined") {
		document.getElementById("link-input").value = ""
	}

	// Bind buttons with correct functions and indices
	document.getElementById("edit-overlay").setAttribute("style", "display: grid;")
	document.getElementById("edit-delete").setAttribute("onclick", "deleteTask("+index+")")
	document.getElementById("edit-delete").onclick = function() {
		deleteTask(index);
	}
	document.getElementById("ok").setAttribute("onclick", "okButton("+index+")")
	document.getElementById("ok").onclick = function() {
		okButton(index);
	}
}
function okButton(index) {
	var zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]
	var name = document.getElementById("name-input").value
	var start = document.getElementById("start-input").value + " " + zone
	var due = document.getElementById("due-input").value + " " + zone
	var link = document.getElementById("link-input").value

	if ((name == "")||(start == "")||(due == "")) {
		alert("Please fill all required fields. (Link is not required)")
		return
	}
	
	if (typeof objects[index] === "undefined") {
		objects[index] = new Task().fromArray(["", "", "", 0, 0, ""])
	}
	objects[index]["name"] = safeString(name)
	objects[index]["start"] = new Date(start)
	objects[index]["due"] = new Date(due)
	if (link != "") {
		objects[index]["link"] = safeString(link)
	} else {
		objects[index]["link"] = ""
	}
	forceUpdate()
	closeOverlay()
	updateTasks()
}
function closeOverlay() {
	document.getElementById("edit-overlay").setAttribute("style", "display: none;")
}
function deleteTask(index) {
	objects = objects.remove(index)
	if (objects.length == 0) {
		let task = new Task()
		objects.push(task.fromArray(["Create a task", new Date(), new Date(), 0, 0, ""]))
	}
	updateTasks()
	forceUpdate()
	closeOverlay()
}
function progressChange(index) {
	var value = document.getElementById("progress-slider"+index).value
	objects[index]["progress"] = value
	needUpdate = true
	updateTasks(false)
}
function scrollslide(event, index) {
	var y = event.deltaY;
	var currentSize;
	var newSize;
	currentSize = event.target.value
	if (y > 0) {
		newSize = parseInt(currentSize) - 5;
	} else {
		newSize = parseInt(currentSize) + 5;
	}
	if (newSize < 0) {
		newSize = 0
	} else if (newSize > 100) {
		newSize = 100
	}
	event.target.value = newSize
	objects[index]["progress"] = newSize
	needUpdate = true
	updateTasks(false);
}
// ----------

// Timer
class AccurateTimer {
	constructor(callback, interval) {
		this.callback = callback
		this.interval = interval
		this.target = new Date().valueOf()
		this.paused = true
		this.timeout = null
	}
	toggle() {
		this.paused = !this.paused
		if (this.paused) clearTimeout(this.timeout)
		this.target = new Date().valueOf()
		this.tick()
	}
	tick(obj = this) {
		if (!obj.paused) {
			obj.target += obj.interval
			obj.timeout = setTimeout(function() {
				obj.tick(obj)
				obj.callback()
			}, obj.target - new Date())
		}
	}
}

let audio = new Audio("/static/Ding.mp3")
const original_title = document.title
let timer_pos = 0
let timer_paused = true
let timer_time = [5, 0]
let timer_loop = new AccurateTimer(timer_tick, 1000)

function timer_tick() {
	timer_time[1] = timer_time[1] - 1
	if (timer_time[1] < 0) {
		timer_time[0] = timer_time[0] -1
		timer_time[1] = 60 + timer_time[1]
	}
	if (timer_time[0] < 0) {
		nextTimer()
	}
	document.getElementById("ticker").innerText = toTimeString(timer_time)
}
function ding(index, express=true) {
	// Play audio and update title
	if (express) {
		audio.currentTime = 0
		audio.play()
		console.log("Ding!")
		document.title = "Time up!"
		setTimeout(function() {
			document.title = original_title
		}, 2000)
	}

	// Set active
	let cards = document.getElementsByClassName("card")
	for (let i = 0; i < cards.length; i++) {
		cards[i].setAttribute("class", "card")
	}
	timer_pos = index
	cards[index].setAttribute("class", "card active")
	timer_time = [cards[index].getAttribute("data-minutes"), 0]
	timer_tick()
}
function nextTimer(reversed = false) {
	if (reversed && timer_pos == 0) {
		timer_pos = 7
	} else if (!reversed && timer_pos == 7) {
		timer_pos = 0
	} else if (reversed) {
		timer_pos--
	} else {
		timer_pos++
	}
	let cards = document.getElementsByClassName("card")
	timer_time = [cards[timer_pos].getAttribute("data-minutes"), 0]
	ding(timer_pos)
}
function pauseTimer() {
	timer_loop.toggle()
	if (timer_paused) {
		document.getElementById("pause-img").setAttribute("src", "/static/Images/pause.svg")
	} else {
		document.getElementById("pause-img").setAttribute("src", "/static/Images/play.svg")
	}
	timer_paused = !timer_paused
}
function toTimeString(time) {
	let output = ""
	output += time[0]
	output += ":"
	if (time[1] < 10) {
		output += "0"
	}
	output += time[1]
	return output
}
ding(timer_pos, false)
// ----------

// Settings
function updateSettings() {
	var output = ""
	function generate(name, link, index) {
		var image = "/static/Images/Google Web Icon.png"
		var pair
		for (pair of imagePairs) {
			var pairLink = pair[0]
			if (link.includes(pairLink)) {
				image = pair[1]
				break
			}
		}

		return "<div class='item'><img src='"+image+"'><p>"+name+"</p><img onclick='linkEditButton("+index+")' class='link-edit' src='/static/Images/New_Edit_Button.png'><img onclick='deleteLink("+index+")' class='link-delete' src='/static/Images/New_Delete_Button.png'></div>"
	}
	for (var i = 0; i < linkdata.length; i++) {
		var link = linkdata[i]
		output += generate(link[1], link[0], i)
	}
	document.getElementById("settings-links").innerHTML = output
	showSelectedCurve()
}
function deleteAll() {
	button = document.getElementById("delete-data")
	if (button.innerText == "Click to confirm") {
		window.location.replace("https://tues.tech/reset/confirm");
	} else {
		button.innerText = "Click to confirm"
		setTimeout(function(){button.innerText = "Delete All Data"}, 2000)
	}
}
function showSelectedCurve() {
	for (var i = 0; i < 3; i++) {
		const element = document.getElementById(i)
		element.innerHTML = element.className
		element.setAttribute("style", "font-weight: normal;")
	}
	document.getElementById(scoreType).innerHTML = "Selected"
	document.getElementById("img"+scoreType).setAttribute("style", "font-weight: bold; filter: brightness(80%);")
}
function setScoreType(type) {
	if (type == 3) {
		var p = document.getElementById("procrastinator")
		p.innerText = "No procrastinating!"
		setTimeout(function(){p.innerText = "4. Procrastinator"}, 1000)
		return
	}
	scoreType = type
	needUpdate = true
	showSelectedCurve()
}
function linkEditButton(index) {
	document.getElementById("link-edit-overlay").setAttribute("style", "display: grid")
	if (index == linkdata.length) {
		document.getElementById("link-name-input").value = ""
		document.getElementById("link-link-input").value = ""
	} else {
		document.getElementById("link-name-input").value = linkdata[index][1]
		document.getElementById("link-link-input").value = linkdata[index][0]
	}

	document.getElementById("link-edit-delete").setAttribute("onclick", "deleteLink("+index+")")
	document.getElementById("link-edit-delete").onclick = function() {
		deleteLink(index);
	}
	document.getElementById("link-ok").setAttribute("onclick", "deleteLink("+index+")")
	document.getElementById("link-ok").onclick = function() {
		linkOkButton(index);
	}
}
function closeLinkOverlay() {
	document.getElementById("link-edit-overlay").setAttribute("style", "display: none")
}
function deleteLink(index) {
	linkdata = linkdata.remove(index)
	updateSettings()
	closeLinkOverlay()
	needUpdate = true
}
function linkOkButton(index) {
	var name = document.getElementById("link-name-input").value
	var link = document.getElementById("link-link-input").value

	linkdata[index] = [formatLink(safeString(link)), safeString(name)]
	closeLinkOverlay()
	updateSettings()
	forceUpdate()
}
function newLink() {
	linkEditButton(linkdata.length)
	document.getElementById("link-name-input").value = ""
	document.getElementById("link-link-input").value = ""
}
// ----------

// Run
startup()
// ----------

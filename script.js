const listEl = document.getElementById("ul-el");
const inputButtonEl = document.getElementById("input-btn");
const exportButtonEl = document.getElementById("export-btn");
const clearButtonEl = document.getElementById("clear-btn");

let addedItemNumber = 0;

inputButtonEl.addEventListener("click", async () => {
	arrayShortener();
});

exportButtonEl.addEventListener("click", function () {
	exportList();
});

clearButtonEl.addEventListener("click", function () {
	clearList();
});

// removing last two categories in the table (Datasheet and Customer Reference)
async function arrayShortener() {
	let tableData = await fetchTableData().then((value) => {
			let finalLenth = value.length-2;
			while (finalLenth < value.length) {
				value.pop();
			}
			return value;
		}
	);
	objectBuilder(tableData);
}

// fetching table data of component from active chrome tab
async function fetchTableData() {
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
	const scraped = await chrome.scripting.executeScript(
		{
			target: { tabId: tabs[0].id },
			func: function () {
				let tableFetch = document.querySelector("#__next > main > div > div.MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-4 > div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-content-xs-flex-start.MuiGrid-grid-xs-12.MuiGrid-grid-md-8 > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-true > div > table > tbody");
				let scrapedArrayData = [];
				for (let i = 0; i < tableFetch.children.length; i++) {
					const element = tableFetch.children[i].outerText;
					scrapedArrayData.push(element);
				}
				return scrapedArrayData;
			},
		})
	return scraped[0].result;
}

// removing RegEx characters and creating an Object for local storage
function objectBuilder(arr) {
	let fullComponentList = [];
	arr.forEach(element => {
			let component = {
				title: "",
				body: "",
			};
			let titleIndex = element.search(/\n\t\n/g);
			component.title = element.slice(0,titleIndex);
			
			let temporatyDetails = element.slice(titleIndex+3);
			let bodyIndex = temporatyDetails.replaceAll(/\n\t|\n/g, " ");
			component.body = bodyIndex;

			fullComponentList.push(component);
	});
	add(fullComponentList);
	console.log(fullComponentList);
}

// TODO Use JSON.Stringify to stringify fullComponentList (value) and add it to the local storage under its own Key
// TODO Use JSON.Parse to turn back all the key value pairs from local storage and display them on the UI
// TODO Prevent adding the same component multiple times
// TODO Make sure that JSON.Parse later comes in handy when exporting everything
// TODO Add the export function

// adding component to local storage
function add(arr) {
	let i = 0;
	arr.forEach(element => {
		console.log("in add(arr) ", element.title, element.body);
		i++;
		localStorage.setItem(addedItemNumber, `${element.title}: ${element.body}`);
		addedItemNumber++;
	});
	localStorage.setItem(addedItemNumber, "break-point");
	addedItemNumber++;
	render();
}

// rendering items from local storage to the extension window
function render() {
	listEl.innerHTML = '';
	let items = Object.keys(localStorage);
	//console.log(`lenght of items is: ` + items.length);
	for (let key = 0; key < items.length; key++) {
		if (localStorage.getItem(key.valueOf()) != "break-point") {
			listEl.innerHTML += `<li>${localStorage.getItem(key)}</li>`;
		} else if (localStorage.getItem(key.valueOf()) == "break-point") {
			listEl.innerHTML += `<br>`;
		}
	}
}

function endStringCleanup(arrayToSave) {
	scrapedArray = arrayToSave;
}

/////////////////////////// TO IMPLEMENT
function exportList() {
}
/////////////////////////// TO IMPLEMENT

function clearList() {
	localStorage.clear();
	listEl.innerHTML = "";
	addedItemNumber = 0;
}

window.addEventListener('DOMContentLoaded', () => {
	render();
});


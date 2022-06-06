const listEl = document.getElementById("ul-el");
const inputButtonEl = document.getElementById("input-btn");
const exportButtonEl = document.getElementById("export-btn");
const clearButtonEl = document.getElementById("clear-btn");

inputButtonEl.addEventListener("click", async () => {
	arrayShortener();
});

exportButtonEl.addEventListener("click", function () {
	exportList();
});

clearButtonEl.addEventListener("click", function () {
	clearList();
});

document.addEventListener('click',function(e){
    if(e.target && (e.target.id== 'delete-btn-label' )){
		let targetChild = e.target.parentElement.parentElement.childNodes[1].childNodes[2].data;
		deleteIndividual(targetChild);
    }
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
				// tableFetch holds the JS Path to the table we want to fetch, change this line of code if it stops working in the future
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
async function objectBuilder(arr) {
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

	// fetching current tab URL
	const currentTab = await chrome.tabs.query({ active: true, currentWindow: true })
	const currentURL =  currentTab[0].url;
	let html = {
		link: currentURL,
	}
	fullComponentList.push(html);

	let dataToStore = convertToString(fullComponentList);
	let componentName = fullComponentList[0].body.toString().replaceAll(/\s/g,'');
	add(componentName, dataToStore);
}

function convertToString(list) {
	return JSON.stringify(list);
}

// adding component to local storage
function add(key, item) {
	let checkExisting = localStorage.getItem(key);
	if (checkExisting){
		alert("Component already added to list");
	}else{
		localStorage.setItem(key, item);
	}
	render();
}

// rendering items from local storage to the extension window
function render() {
	listEl.innerHTML = '';
	let localStorageItems = Object.keys(localStorage);
	localStorageItems.forEach(element => {
		parsedElement = JSON.parse(localStorage.getItem(element));
		let addToListEl = '';
		for (let i = 0; i < parsedElement.length; i++) {
			if ('title' in parsedElement[i]) {
				addToListEl += `<b>${parsedElement[i].title}:</b> ${parsedElement[i].body}<br>`;
			}else if ('link' in parsedElement[i]){
				addToListEl += `<a id="link" href="${parsedElement[i].link}"><b>Link</b></a>`;
			}
		}
		listEl.innerHTML += `
		<li id="list">
			<div id="listItems">
				${addToListEl}
			</div>
			<div id="delete-btn">
				<label id="delete-btn-label">X</label>
			</div>
		</li>
		<br>`;
	});
}

// removing item from local storage and re-rendering
function deleteIndividual(itemToDelete) {
	if (window.confirm("Are you sure you want to remove this component?")) {
		localStorage.removeItem(itemToDelete.toString().replaceAll(/\s/g,''));
		render();
		window.alert("Component removed!");
	}
}

// getting local time for file name, creating temporary download element, downloading file
function exportList(text) {
	let dateOffset = (new Date()).getTimezoneOffset() * 60000;
    let localTime = (new Date(Date.now() - dateOffset)).toISOString().slice(0, 19);
    let fileName = `${localTime} Components List`;

	let element = document.createElement('a');
	// change the data type here according to IANA Text templates
	element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', fileName);
	  
	element.style.display = 'none';
	document.body.appendChild(element);
	  
	element.click();
	  
	document.body.removeChild(element);
}

function clearList() {
	localStorage.clear();
	listEl.innerHTML = "";
}

window.addEventListener('DOMContentLoaded', () => {
	render();
});


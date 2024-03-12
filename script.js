const listEl = document.getElementById("ul-el");
const inputButtonEl = document.getElementById("input-btn");
const exportButtonEl = document.getElementById("export-btn");
const clearButtonEl = document.getElementById("clear-btn");

// Change this string to fit webpage element you wish to fetch
const bodySelector = "#__next > div > div.ThreeColumnLayout_content__eTm7W > div > div > div.Grid_col-lg-10__FPLVk.Grid_col-xs__w58_v.Grid_col-sm__DsLxt.Grid_col-md__eg0dB > section.Box_box__CCDqC.AdPage_adInfoBox__oxywY"
// Change this string to fit webpage title you wish to fetch
const titleSelector = "#__next > div > div.ThreeColumnLayout_content__eTm7W > div > div > div.Grid_col-lg-10__FPLVk.Grid_col-xs__w58_v.Grid_col-sm__DsLxt.Grid_col-md__eg0dB > section.Box_box__CCDqC.AdPage_adInfoBox__oxywY > div.AdPage_adInfoHolder__wCKs4.AdPage_hasBorder__x5yTs > section.AdViewInfo_adViewInfoHolder__3OMT7 > h1"
// Change this string to fit webpage price you wish to fetch
const priceSelector = "#__next > div > div.ThreeColumnLayout_content__eTm7W > div > div > div.Grid_col-lg-10__FPLVk.Grid_col-xs__w58_v.Grid_col-sm__DsLxt.Grid_col-md__eg0dB > section.Box_box__CCDqC.AdPage_adInfoBox__oxywY > div.AdPage_adInfoHolder__wCKs4.AdPage_hasBorder__x5yTs > section.AdViewInfo_adViewInfoHolder__3OMT7 > div:nth-child(3) > h2"
// Change this string to fit webpage body you wish to fetch
const listingBodySelector = "#__next > div > div.ThreeColumnLayout_content__eTm7W > div > div > div.Grid_col-lg-10__FPLVk.Grid_col-xs__w58_v.Grid_col-sm__DsLxt.Grid_col-md__eg0dB > section.Box_box__CCDqC.AdPage_adInfoBox__oxywY > div.Grid_row__pl8x2 > div > section > div:nth-child(1) > p"

inputButtonEl.addEventListener("click", async () => {
	arrayShortener();
});

exportButtonEl.addEventListener("click", function () {
	//exportList();
	fetchFromStorage();
});

clearButtonEl.addEventListener("click", function () {
	clearList();
});

document.addEventListener('click', function (e) {
	if (e.target && (e.target.id == 'delete-btn-label')) {
		let targetChild = e.target.parentElement.parentElement.childNodes[1].childNodes[2].data;
		deleteIndividual(targetChild);
	}
});


// fetch table data and create tableData object
async function arrayShortener() {
	let tableData = await fetchTableData().then((value) => {
		let finalLenth = value.length - 2;
		while (finalLenth < value.length) {
			value.pop();
		}
		return value;
	}
	);
	objectBuilder(tableData);
}

// fetching table data of listing from active chrome tab
async function fetchTableData() {
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
	const scraped = await chrome.scripting.executeScript(
		{
			target: { tabId: tabs[0].id },
			func: function () {
				// tableFetch holds the JS Path to the table we want to fetch
				let tableFetch = document.querySelector(bodySelector)
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
	let completeListing = [];
	arr.forEach(element => {
		let listing = {
			title: "",
			price: "",
			body: "",
		};

		// fetch title
		let titleIndex = document.querySelector(titleSelector)
		let titleFinal = titleIndex.replaceAll(/\n\t|\n/g, " ");
		listing.title = titleFinal;

		// fetch price
		let priceIndex = document.querySelector(priceSelector)
		let priceFinal = priceIndex.replaceAll(/\n\t|\n/g, " ");
		listing.price = priceFinal;

		// fetch body
		let temporatyBody = document.querySelector(listingBodySelector)
		let bodyFinal = temporatyBody.replaceAll(/\n\t|\n/g, " ");
		listing.body = bodyFinal;
		completeListing.push(listing);
	});

	// fetching current tab URL
	let dataToStore = convertToString(completeListing);
	let listingName = completeListing[0].body.toString().replaceAll(/\s/g, '');
	add(listingName, dataToStore);
}

function convertToString(list) {
	return JSON.stringify(list);
}

// adding listing to local storage
function add(key, item) {
	let checkExisting = localStorage.getItem(key);
	if (checkExisting) {
		alert("listing already added to list");
	} else {
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
				// TODO Check this ELSE IF, maybe I dont need it
			} else if ('link' in parsedElement[i]) {
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
	if (window.confirm("Are you sure you want to remove this listing?")) {
		localStorage.removeItem(itemToDelete.toString().replaceAll(/\s/g, ''));
		render();
		window.alert("listing removed!");
	}
}

// getting local time for file name, creating temporary download element, downloading file
function exportList(text) {
	let dateOffset = (new Date()).getTimezoneOffset() * 60000;
	let localTime = (new Date(Date.now() - dateOffset)).toISOString().slice(0, 19);
	let fileName = `${localTime} KP listings.csv`;

	let element = document.createElement('a');
	// change the data type here according to IANA Text templates
	element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', fileName);
	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();
	document.body.removeChild(element);
}

function fetchFromStorage() {
	let localStorageData = []
	let keys = Object.keys(localStorage);
	let i = keys.length;
	let text = '';

	keys.forEach(element => {
		let returnedItem = localStorage.getItem(element);
		let parsedItem = JSON.parse(returnedItem);

		// these three values are required for my exported list, change these however you like
		let expTitle = 'Title';
		let expPrice = 'Price';
		let expBody = 'Body';

		let foundTitle = findInternalItem(parsedItem, expTitle);
		let foundPrice = findInternalItem(parsedItem, expPrice);
		let foundBody = findInternalItem(parsedItem, expBody);

		text += `${parsedItem[0].body};${parsedItem[parsedItem.length - 1].link};${foundTitle};${foundPrice};${foundBody}\n`;
	});

	exportList(text)
}

function findInternalItem(arr, value) {
	foundItem = '';
	arr.forEach(item => {
		if (item.title == value) {
			foundItem = item.body;
		}
	});
	return foundItem;
}

function allStorage() {

	var values = [],
		keys = Object.keys(localStorage),
		i = keys.length;

	while (i--) {
		values.push(localStorage.getItem(keys[i]));
	}

	return values;
}

function clearList() {
	localStorage.clear();
	listEl.innerHTML = "";
}

window.addEventListener('DOMContentLoaded', () => {
	render();
});


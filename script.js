const listEl = document.getElementById("ul-el");
const inputButtonEl = document.getElementById("input-btn");
const exportButtonEl = document.getElementById("export-btn");
const clearButtonEl = document.getElementById("clear-btn");

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
		let targetChild = e.target.parentElement.parentElement.childNodes[1].childNodes[1].childNodes[0].data
		deleteIndividual(targetChild);
	}
});


// fetch table data and create tableData object
async function arrayShortener() {

	let tableData = await fetchTableData()
	objectBuilder(tableData);
	console.log(tableData);
}

// fetching table data of listing from active chrome tab
async function fetchTableData() {
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
	const scraped = await chrome.scripting.executeScript({
		target: { tabId: tabs[0].id },
		func: function () {
			// tableFetch holds the JS Path to the table we want to fetch
			let scrapedArrayData = [];

			// fetch image
			let imageUrl = document.querySelector("#__next > div > div.ThreeColumnLayout_content__eTm7W > div > div > div.Grid_col-lg-10__FPLVk.Grid_col-xs__w58_v.Grid_col-sm__DsLxt.Grid_col-md__eg0dB > section.Box_box__CCDqC.AdPage_adInfoBox__oxywY > div.AdPage_adInfoHolder__wCKs4.AdPage_hasBorder__x5yTs > section.AdViewInfo_adViewInfoHolder__3OMT7 > div.AdViewInfo_galleryHolder__5RW6n > div > div > div > div > div > div.GallerySlideItem_imageGallerySlide__geSQn.GallerySlideItem_center__sbdMK > div> img").src

			// fetch title
			let titleIndex = document.querySelector("#__next > div > div.ThreeColumnLayout_content__eTm7W > div > div > div.Grid_col-lg-10__FPLVk.Grid_col-xs__w58_v.Grid_col-sm__DsLxt.Grid_col-md__eg0dB > section.Box_box__CCDqC.AdPage_adInfoBox__oxywY > div.AdPage_adInfoHolder__wCKs4.AdPage_hasBorder__x5yTs > section.AdViewInfo_adViewInfoHolder__3OMT7 > h1")
			let innerTitle = titleIndex.textContent || titleIndex.innerText || "";

			// fetch price
			let priceIndex = document.querySelector("#__next > div > div.ThreeColumnLayout_content__eTm7W > div > div > div.Grid_col-lg-10__FPLVk.Grid_col-xs__w58_v.Grid_col-sm__DsLxt.Grid_col-md__eg0dB > section.Box_box__CCDqC.AdPage_adInfoBox__oxywY > div.AdPage_adInfoHolder__wCKs4.AdPage_hasBorder__x5yTs > section.AdViewInfo_adViewInfoHolder__3OMT7 > div:nth-child(3) > h2")
			let priceArray = priceIndex.innerHTML.split('<span>'[0]);
			let innerPrice = priceArray[0];
			//let innerPrice = price.textContent || price.innerText || "";

			// fetch body
			let temporatyBody = document.querySelector("#__next > div > div.ThreeColumnLayout_content__eTm7W > div > div > div.Grid_col-lg-10__FPLVk.Grid_col-xs__w58_v.Grid_col-sm__DsLxt.Grid_col-md__eg0dB > section.Box_box__CCDqC.AdPage_adInfoBox__oxywY > div.Grid_row__pl8x2 > div > section > div:nth-child(1) > p")
			let innerBody = temporatyBody.textContent || temporatyBody.innerText || "";

			// fetch category
			let categoryIndex = document.querySelector("#__next > div > div.ThreeColumnLayout_content__eTm7W > div > div > div.Grid_col-lg-10__FPLVk.Grid_col-xs__w58_v.Grid_col-sm__DsLxt.Grid_col-md__eg0dB > section.Box_box__CCDqC.AdPage_adInfoBox__oxywY > div.BreadcrumbHolder_breadcrumbHolder__riFtq.BreadcrumbHolder_sidePadding__PF_e7 > div > div.Grid_col-lg-10__FPLVk.Grid_col-xs__w58_v.Grid_col-sm__DsLxt.Grid_col-md__eg0dB.BreadcrumbHolder_breadcrumb__5NZIE > span")
			let category = categoryIndex.textContent || categoryIndex.innerText || "";

			scrapedArrayData.push(imageUrl);
			scrapedArrayData.push(innerTitle);
			scrapedArrayData.push(innerPrice);
			scrapedArrayData.push(innerBody);
			scrapedArrayData.push(category);

			return scrapedArrayData;
		},
	})
	return scraped[0].result;
}

// removing RegEx characters and creating an Object for local storage
async function objectBuilder(arr) {
	let completeListing = [];
	let listing = {
		title: "",
		img: "",
		price: "",
		body: "",
		category: "",
	};

	listing.img = arr[0];
	listing.title = arr[1].replaceAll(/\n\t|\n/g, " ");
	listing.price = arr[2].replaceAll(/\n\t|\n/g, " ");
	listing.body = arr[3].replaceAll(/\n\t|\n/g, " ");
	listing.category = arr[4];

	completeListing.push(listing);


	let dataToStore = convertToString(completeListing);
	add(listing.title, dataToStore);
};

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
		console.log(typeof(itemToDelete) )
		let getItemKeyIndex = itemToDelete.split(':'[0]);
		let getItemKey = getItemKeyIndex[0]
		localStorage.removeItem(getItemKey.toString());
		console.log(getItemKey)
		render();
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

	let foundImg = ''
	let foundTitle = ''
	let foundPrice = ''
	let foundBody = ''
	let foundCategory = ''

	keys.forEach(element => {
		let returnedItem = localStorage.getItem(element);
		let parsedItem = JSON.parse(returnedItem);

		parsedItem.forEach(element => {
			foundImg = element.img;
			foundTitle = element.title;
			foundPrice = element.price;
			foundBody = element.body;
			foundCategory = element.category;
		});
		text += `${foundImg};${foundTitle};${foundPrice};${foundBody};${foundCategory};\n`;
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


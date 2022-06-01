const listEl = document.getElementById("ul-el")
const inputButtonEl = document.getElementById("input-btn")
const exportButtonEl = document.getElementById("export-btn")
const clearButtonEl = document.getElementById("clear-btn")
const startSearchTerm = `<tbody class="MuiTableBody-root">`
const endSearchTerm = `<div class="jss148">`
const trimStepOneStart = `<div class="jss130">`
const trimStepOneEnd = `</td><td class="MuiTableCell-root MuiTableCell-body jss131">`


let scrapedData
let tempSnippet
let betweenStepsSnippet
let finalSnippet
let startIndexOfSearchTerm
let endIndexOfSearchTerm
let scrapedArray = []
let addedItemNumber = 0


inputButtonEl.addEventListener("click", function () {
})

exportButtonEl.addEventListener("click", function () {
	exportList()
})

clearButtonEl.addEventListener("click", function () {
	clearList()
})



function stringSlicer(sliceOfPie) {

	startIndexOfSearchTerm = sliceOfPie.indexOf(startSearchTerm)
	//endIndexOfSearchTerm = sliceOfPie.lastIndexOf(endSearchTerm)
	endIndexOfSearchTerm = sliceOfPie.indexOf(endSearchTerm)
	betweenStepsSnippet = sliceOfPie.slice(startIndexOfSearchTerm, endIndexOfSearchTerm)
	//console.log(betweenStepsSnippet)	//works

	startIndexOfSearchTerm = betweenStepsSnippet.indexOf(trimStepOneStart)
	endIndexOfSearchTerm = betweenStepsSnippet.lastIndexOf(trimStepOneEnd)
	betweenStepsSnippet = betweenStepsSnippet.slice(startIndexOfSearchTerm, endIndexOfSearchTerm)

	//console.log(betweenStepsSnippet)	//Doesnt work
	stringCleanup(betweenStepsSnippet)

}

function stringCleanup(snippedString) {
	let keyWordClosedBracket = `>`
	let keyWordOpenBracket = `<`
	let keyWordDatasheet = `Datasheet`
	let keyWordRef = `Customer Reference`
	let keyWordNBSP = `&nbsp;`
	let tempArray = []
	let tempFullArray = []

	for (let i = 0; i < snippedString.length; i++) {

		if (snippedString.indexOf(keyWordClosedBracket, i) + 1 < snippedString.indexOf(keyWordOpenBracket, i)) {
			let startOfFoundString = snippedString.indexOf(keyWordClosedBracket, i)
			let endOfFoundString = snippedString.indexOf(keyWordOpenBracket, i)
			let tempHolder = snippedString.slice(startOfFoundString + 1, endOfFoundString)
			//console.log(tempHolder)
			if (tempHolder != keyWordDatasheet && tempHolder != keyWordRef && tempHolder != keyWordNBSP) {
				tempArray.push(tempHolder)

				if (tempArray[tempArray.length - 1] != tempFullArray[tempFullArray.length - 1]) {
					tempArray.pop()
					tempFullArray.push(tempHolder)


					if (tempFullArray.length > 20) {
						endStringCleanup(tempFullArray)
					} else {
						tempArray.pop()
						//console.log("Somethings fucky wucky")
					}
				}
			}
		}
	}
	endStringCleanup(tempFullArray)
	add()
}

function add() {
	scrapedArray.forEach(element => {
		localStorage.setItem(addedItemNumber, element);
		addedItemNumber++;
	});
	localStorage.setItem(addedItemNumber, "break-point");
	addedItemNumber++;
	render();
}

function render() {
	listEl.innerHTML = ''; 
	let items = Object.keys(localStorage);
	console.log(`lenght of items is: ` + items.length);
	for(let key = 0; key < items.length; key++) {
		if (localStorage.getItem(key.valueOf()) != "break-point"){
			listEl.innerHTML += `<li>${localStorage.getItem(key)}</li>`;
		}else if (localStorage.getItem(key.valueOf()) == "break-point"){
			listEl.innerHTML += `<br>`;
		}
	}
}

function endStringCleanup(arrayToSave) {
	scrapedArray = arrayToSave
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

function scrapeThePage() {
	var htmlCode = document.documentElement.outerHTML
	return htmlCode
}

document.addEventListener('DOMContentLoaded', () => {
	// Reaching the export-btn
	const fbshare = document.querySelector('#input-btn')
	fbshare.addEventListener('click', async () => {
		// Get the active tab
		const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
		const scraped = await chrome.scripting.executeScript(
			{
				target: { tabId: tabs[0].id },
				func: scrapeThePage,
			})
		// Result will be an array of values from the execution
		// For testing this will be the same as the console output if you ran scriptToExec in the console
		scrapedData = scraped[0].result
		stringSlicer(scrapedData)
	})
})

window.addEventListener('DOMContentLoaded', () => {
    render();
});

/////////////////// TESTING GROUND
/*
let testLet = "123"
var testVar = "123"
notDeclaredVar = "456"

function exportList(){
	// console.log(testLet) 						// reachable declared GLOBAL VAR
	// console.log(testVar) 						// reachable declared GLOBAL LET
	// console.log(notDeclaredVar) 					// reachable non declared GLOBAL VAR
	// console.log(letWithinAFunction) 				// Cannot reach a LET within a function
	// console.log(varWithinAFunction)		 		// Cannot reach a VAR within a function
	// console.log(notDeclaredVarWithinAFunction) 	// Cannot reach not declared VAR within a function
}

function someOtherFunction(){
	let letWithinAFunction = "letWithinAFunction"
	var varWithinAFunction = "varWithinAFunction"
	notDeclaredVarWithinAFunction = "notDeclaredVarWithinAFunction"
}
*/
/////////////////// TESTING GROUND

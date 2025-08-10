const tiersElement = document.getElementById("tiers");
const tierTemplate = document.getElementById("tier-template");
const itemTemplate = document.getElementById("item-template");
const settingsElement = document.getElementById("settings");

let draggingElement = null;


// alert("Окно настроек можно открыть нажатием ESC");


document.addEventListener("click", function (event) {
	if (event.target.classList.contains("gs-image")) {
		event.stopImmediatePropagation();
		event.preventDefault();
	}
}, true);


// When ESC pressed
document.addEventListener("keydown", function (event) {
	if (event.key != "Escape") { return; }
	alert("ESC pressed");
});


document.addEventListener("dragstart", function (event) {
	let eClassList = event.target.classList;
	if (eClassList.contains("item") || eClassList.contains("gs-image")) {
		draggingElement = event.target;
	} else {
		draggingElement = null;
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
})


function tierDropEvent(event) {
	if (!draggingElement) {
		return false;
	}
	if (draggingElement == event.target.closest(".item")) {
		return false;
	}

	// Getting item
	let item;
	if (draggingElement.className == "item") {
		item = draggingElement;
	} else {
		let src = draggingElement.closest(".gs-image").src;
		if (document.querySelector(`#left-panel img[src='${src}']`)) {
			if (!confirm("Такая картинка уже существует. Добавить ещё одну?")) {
				return false;
			}
		}
		let title = document.querySelector("input.gsc-input").value;
		item = createItem(title, src);
	}
	draggingElement = null;

	// Getting target
	if (event.target.className == "tier-content") {
		event.target.closest(".tier-content").appendChild(item);
	} else if (event.target.id == "tiers") {
		let tier = createTier();
		tier.querySelector(".tier-content").appendChild(item);
	} else if (event.target.id == "shell") {
		document.querySelector("#shell").appendChild(item);
	} else {
		let hoveredItem = event.target.closest(".item");
		hoveredItem.insertAdjacentElement('afterend', item);
	}
}
document.querySelector("#shell").ondrop = tierDropEvent;
tiersElement.ondrop = tierDropEvent;


function createTier(title, color, content) {
	const tier = tierTemplate.content.cloneNode(true).querySelector(".tier");
	tiersElement.appendChild(tier);

	const tierTitle = tier.querySelector(".tier-title");

	tier.querySelector(".tier-content").ondrop = tierDropEvent;
	tierTitle.onwheel = changeFontSize;
	tierTitle.onkeydown = preventNewLine;

	tier.querySelector(".tier-settings-button-top").onclick = moveTierTop;
	tier.querySelector(".tier-settings-button-bottom").onclick = moveTierBottom;
	tier.querySelector(".tier-settings-button-color").onclick = changeTierColor;
	tier.querySelector(".tier-settings-button-delete").onclick = deleteTier;

	tier.dataset.tier = title;

	tierTitle.innerText = title ? title : "…";
	tierTitle.style.backgroundColor = color ? color : "#c86a6a";

	if (content) {
		content.forEach(element => {
			let item = createItem(element.title, element.image);
			tier.querySelector(".tier-content").appendChild(item);
		});
	}

	tierTitle.dispatchEvent(new Event("input"));
	return tier;
}


function moveTierTop(event) {
	let tier = event.target.closest(".tier");
	tier.previousSibling.insertAdjacentElement('beforebegin', tier);
}


function moveTierBottom(event) {
	let tier = event.target.closest(".tier");
	tier.nextSibling.insertAdjacentElement('afterend', tier);
}


function changeTierColor(event) {
	let tier = event.target.closest(".tier");
	let color = window.prompt("Выберите цвет для тира", tier.style.backgroundColor);
	if (color) {
		tier.style.backgroundColor = color;
	}
}


function deleteTier(event) {
	let tier = event.target.closest(".tier");
	let tierTitle = tier.querySelector(".tier-title").innerText;
	let dicision = window.confirm(`Вы уверены, что хотите удалить тир "${tierTitle}"?`);
	if (!dicision) { return; }
	tier.remove();
}


function createItem(title, image) {
	const item = itemTemplate.content.cloneNode(true).querySelector(".item");
	if (title) {
		item.querySelector(".item-title").value = title;
		item.dataset.title = title;
	}
	if (image) {
		item.querySelector(".item-image").src = image;
	}
	return item;
};


function deleteItem() { } // TODO


document.body.addEventListener("dragover", function (event) {
	event.preventDefault();
	return false;
});


function changeFontSize(event) {
	let fontSize = parseInt(window.getComputedStyle(event.target).fontSize);
	if (event.deltaY < 0) {
		fontSize += 2
	} else if (event.deltaY > 0) {
		fontSize -= 2
	}
	fontSize = Math.min(Math.max(fontSize, 8), 100);
	event.target.style.fontSize = fontSize + "px";
}


function preventNewLine(event) {
	if (event.key == "Enter") {
		event.preventDefault();
	}
}


function loadLocalImage() {

}


function exportToJson() {
	let data = []; // not dict because tiers can share the same title (don't know why but why not)
	tiersElement.querySelectorAll(".tier").forEach(tier => {
		let tierData = {
			tier: tier.dataset.tier,
			items: []
		}
		tier.querySelectorAll(".item").forEach(item => {
			tierData.items.push({
				title: item.dataset.title,
				image: item.querySelector(".item-image").src,
				fontSize: item.querySelector(".item-title").style.fontSize,
			})
		})
	})
}



function loadDefault() {
	createTier(title = "S", color = "#c86a6a");
	createTier(title = "A", color = "#f9c262");
	createTier(title = "B", color = "#e7d36e");
	createTier(title = "C", color = "#e7e384");
	createTier(title = "D", color = "#89ea76");
}


function test() {
	// let temp_items = [
	// 	{ "title": "Item 1", "image": ".tests/anime4.png" },
	// 	{ "title": "Item 2", "image": ".tests/anime5.png" },
	// 	{ "title": "Item 3", "image": ".tests/dsadas_2.png" },

	// ]

	// createTier(title = "S", color = "#c86a6a", items = temp_items);
	// createTier(title = "A", color = "#f9c262");
	// createTier(title = "B", color = "#e7d36e");
	// exportToJson();

	for (let i = 1; i < 100; i++) {
		let item = createItem("Item " + i, ".tests/anime4.png");
		document.querySelector("#shell").appendChild(item);
	}
}
test();


function loadDefault() {
	createTier(title = "S", color = "#c86a6a");
	createTier(title = "A", color = "#f9c262");
	createTier(title = "B", color = "#e7d36e");
	createTier(title = "C", color = "#e7e384");
	createTier(title = "D", color = "#89ea76");
}
loadDefault()


const tiersElement = document.getElementById("tiers");
const tierTemplate = document.getElementById("tier-template");
const itemTemplate = document.getElementById("item-template");
const settingsElement = document.getElementById("settings");
const colorPicker = document.getElementById("tier-color-picker");

let draggingElement = null;

document.addEventListener("click", function (event) {
	if (event.target.classList.contains("gs-image")) {
		event.stopImmediatePropagation();
		event.preventDefault();
	}
}, true);


document.body.addEventListener('drop', function (event) {
	event.preventDefault();
	console.log(event.target, event.currentTarget);

	const files = event.dataTransfer.files;
	if (!files || files.length == 0) { return; }
	const file = files[0];
	if (file.type == "application/json" && file.name.toLowerCase().endsWith(".json")) {
		const reader = new FileReader();
		console.log(reader);
		reader.onload = () => {
			let data = JSON.parse(reader.result);
			console.log(data);
		};
		reader.readAsText(file, 'utf-8');
	} else if (file.type.startsWith("image/")) {
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0);
				const dataUrl = canvas.toDataURL("image/png", 1);

				const title = file.name.substring(0, file.name.lastIndexOf('.'))

				if (document.querySelector(`#left-panel img[src='${dataUrl}']`)) {
					const dicision = confirm("Такая картинка уже существует. Добавить ещё одну?");
					if (!dicision) { return false; }
				}

				let item = createItem(title, dataUrl);
				distributeItem(event, item);
			}
			img.src = reader.result;
		};
		reader.readAsDataURL(file);
	}
});


document.addEventListener("dragstart", function (event) {
	const eClassList = event.target.classList;
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
	if (!draggingElement) { return false; }
	if (draggingElement == event.target.closest(".item")) { return false; }

	// Getting item
	let item;
	if (draggingElement.className == "item") {
		item = draggingElement;
	} else {
		let src = draggingElement.closest(".gs-image").src;
		if (document.querySelector(`#left-panel img[src='${src}']`)) {
			const dicision = confirm("Такая картинка уже существует. Добавить ещё одну?");
			if (!dicision) { return false; }
		}
		const title = document.querySelector("input.gsc-input").value;
		item = createItem(title, src);
	}
	draggingElement = null;

	distributeItem(event, item);
}


function distributeItem(event, item) {
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
	const tier = event.target.closest(".tier");
	tier.previousSibling.insertAdjacentElement('beforebegin', tier);
}


function moveTierBottom(event) {
	const tier = event.target.closest(".tier");
	tier.nextSibling.insertAdjacentElement('afterend', tier);
}


function changeTierColor(event) {
	const tierTitle = event.target.closest(".tier").querySelector(".tier-title");
	colorPicker.style.top = event.clientY + "px";
	colorPicker.oninput = e => tierTitle.style.backgroundColor = e.target.value;
	colorPicker.addEventListener("blur", function (event) {
		colorPicker.removeEventListener("input", onInput);
	});
	colorPicker.click();
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

		let titleElement = tier.querySelector(".tier-title");
		let fontSize = parseInt(window.getComputedStyle(titleElement).fontSize);
		let color = titleElement.style.backgroundColor;

		let tierData = {
			tier: titleElement.innerText,
			color: color,
			fontSize: fontSize,
			items: [],
		}

		tier.querySelectorAll(".item").forEach(item => {
			tierData.items.push({
				title: item.dataset.title,
				image: item.querySelector(".item-image").src,
				fontSize: item.querySelector(".item-title").style.fontSize,
			})
		})

		data.push(tierData);
	})
	data = JSON.stringify(data, null, 2);

	let blob = new Blob([data], { type: "application/json" });
	let url = URL.createObjectURL(blob);
	let a = document.createElement("a");
	a.href = url;
	a.download = "tierlist.json";
	a.click();
	setTimeout(() => {
		window.URL.revokeObjectURL(url);
	}, 100);
}



function loadDefault() {
	createTier(title = "S", color = "#c86a6a");
	createTier(title = "A", color = "#f9c262");
	createTier(title = "B", color = "#e7d36e");
	createTier(title = "C", color = "#e7e384");
	createTier(title = "D", color = "#89ea76");
}


function loadDefault() {
	createTier(title = "S", color = "#c86a6a");
	createTier(title = "A", color = "#f9c262");
	createTier(title = "B", color = "#e7d36e");
	createTier(title = "C", color = "#e7e384");
	createTier(title = "D", color = "#89ea76");
}
loadDefault()

// exportToJson()
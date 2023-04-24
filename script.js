let settingsEnabled = false

function toggleSettings() {
  settingsEnabled = !settingsEnabled
  let styles = Array.from(document.styleSheets[0].cssRules)
  let colorPicker = styles.find(item => item.selectorText == "input[type=\"color\"]")
  let deleteRow = styles.find(item => item.selectorText == ".deleteRow")
  let rowName = styles.find(item => item.selectorText == ".rowName")
  if (settingsEnabled) {
    colorPicker.style.display = "block"
    deleteRow.style.display = "block"
    rowName.style.height = "auto"
  } else {
    colorPicker.style.display = "none"
    deleteRow.style.display = "none"
    rowName.style.height = "100%"
  }
}

function rowDragLeave(e) {
  return false
}

function rowDragOver(e) {
  e.preventDefault()
  return false
}

function rowDrop(e){
  e.preventDefault()
  let data = e.dataTransfer.getData("text")
  let el = document.querySelector(`[src="${data}"]`)

  if(el.className != "cell") {
    el = createCell(data,el.title) // открытые изображения не распознаются
  }

  if(e.target.className == "rowArea"){
    e.target.append(el)
  } else if(e.target.className == "cell"){
    let row = e.target.parentElement
    row.insertBefore(el, e.target)
  }
  return false
}

function cellDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.src)
  return false
}

function createCell(link, title="") {
  let el = document.createElement("img")
  el.src = link
  el.title = title
  el.className = "cell"
  return el
}

function shelfDragOver(e) {
  e.preventDefault()
  return false
}

function shelfDrop(e) {
  e.preventDefault()
  let data = e.dataTransfer.getData("text")
  let el = document.querySelector(`[src="${data}"]`)

  if(el.className != "cell") {
    el = createCell(data,el.title)
  }

  if(e.target.id=="shelf"){
    e.target.append(el)
  }
  return false
}

function trashDragOver(e) {
  e.preventDefault()
  return false
}

function trashDrop(e){
  let data = e.dataTransfer.getData("text")
  let el = document.querySelector(`[src="${data}"]`)
  if(el.className=="cell"){
    el.remove()
  }
  return false
}

function fitText(e){
  console.log(e)
  textFit(e.target, {maxFontSize: 30, multiline: true})
}

function changeRowColor(e){
  let color = e.target.value
  let rowTitle = e.target.parentElement
  rowTitle.style.backgroundColor = color
}

function removeRow(e) {
  e.target.parentElement.parentElement.remove()
}

function addRow(name = "...", color = "#1f9108") {
  let rows = document.getElementById("rows")

  let row = document.createElement("div")
  row.className = "row"

  let rowTitle = document.createElement("div")
  rowTitle.className = "rowTitle"
  rowTitle.style.backgroundColor = color

  let rowName = document.createElement("div")
  rowName.className = "rowName"
  rowName.innerText = name
  rowName.contentEditable = true
  rowName.oninput = fitText

  let colorPicker = document.createElement("input")
  colorPicker.className = "colorPicker"
  colorPicker.type = "color"
  colorPicker.value = color
  colorPicker.onchange = changeRowColor

  let deleteRow = document.createElement("button")
  deleteRow.className = "deleteRow"
  deleteRow.innerText = "🗑"
  deleteRow.onclick = removeRow
  //deleteRow.onclick = function() {row.remove()} 
  //можно и так, но в для красоты вынес в отдельную функцию

  let rowArea = document.createElement("div")
  rowArea.className = "rowArea"

  row.ondragover = rowDragOver
  row.ondrop = rowDrop

  rowTitle.append(rowName)
  rowTitle.append(colorPicker)
  rowTitle.append(deleteRow)
  row.append(rowTitle)
  row.append(rowArea)
  rows.append(row)
}



function addCell(link, title="") {
  let img = document.createElement("img")
  img.className = "cell"
  img.draggable = true
  img.title = title
  img.src = link
  document.getElementById("shelf").append(img)
}

window.addEventListener("load", (event) => {
  addRow("S", "#c86a6a")
  addRow("A", "#f9c262")
  addRow("B", "#e7d36e")
  addRow("C", "#e7e384")
  addRow("D", "#89ea76")
})

for (let i = 1; i <= 100; i++) {
    let str = "";
    let n = i;

    while (n > 0) {
        let rem = n % 26;
        // console.log("rem=" + rem);
        if (rem == 0) {
            str = "Z" + str;
            n = Math.floor(n / 26) - 1;
        }
        else {
            str = String.fromCharCode((rem - 1) + 65) + str;
            n = Math.floor(n / 26);
            // console.log("n="+ n);
        }
    }
    $("#columns").append(`<div class="column-name column-${i}" id="${str}">${str}</div>`)
    $("#rows").append(`<div class="row-name">${i}</div>`)
}

let cellData = {
    "Sheet1": {}
};

let saved = true;//assume that file is already saved

let selectedSheet = "Sheet1"; // default selected sheet is Sheet1
let totalSheets = 1; //default no of sheets is 1
let lastlyaddedSheet = 1; 

// now this are the default properties which we will just keep but store in every cell
let defaultProperties = {
    "font-family": "Noto Sans",
    "font-size": 14,
    "text": "",
    "bold": false,
    "italic": false,
    "underlined": false,
    "alignment": "left",
    "color": "#444",
    "bgcolor": "#fff",
    "formula":"",
    "upStream":[],
    "downStream":[]
}
// to make cells
for (let i = 0; i <= 100; i++) {
    let row = $(`<div class="cell-row"></div>`);
    //let rowArray = [];
    for (let j = 0; j <= 100; j++) {
        row.append(`<div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`);
        // rowArray.push({
        //     "font-family": "Noto Sans",
        //     "font-size": 14,
        //     "text":"",
        //     "bold":false,
        //     "italic":false,
        //     "underlined":false,
        //     "alignment":"left",
        //     "color": "#444",
        //     "bgcolor": "#fff"
        // })
    }
    //cellData.push(rowArray);
    $("#cells").append(row);
}

const ps = new PerfectScrollbar("#cells", {
    // wheelSpeed: 15,
    // wheelPropogation: true
});

$("#cells").scroll(function (e) {
    $("#columns").scrollLeft(this.scrollLeft);
    $("#rows").scrollTop(this.scrollTop);
})

$(".input-cell").dblclick(function (e) {

    //$(".input-cell.selected").removeClass("selected top-selected bottom-selected left-selected right-selected");
    $(this).attr("contenteditable", "true");
    $(this).addClass("selected");
    $(this).focus();
})

$(".input-cell").blur(function (e) {
    $(this).attr("contenteditable", "false");
    // blur means when we move to another cell that means we have stopped writing in that cell after that update cell data
    updateCellData("text",$(this).text());
    
})

function getRowCell(ele) {
    let id = $(ele).attr("id");
    let idArray = id.split("-");
    let rowId = parseInt(idArray[1]); // we will get row number
    let colId = parseInt(idArray[3]); // we will get col number

    return [rowId, colId];
}

function getTopLeftBottomRightCell(rowId, colId) {
    let topCell = $(`#row-${rowId - 1}-col-${colId}`);
    //console.log($(`#row-${rowId - 1}-col-${colId}`));
    let bottomCell = $(`#row-${rowId + 1}-col-${colId}`);
    let leftCell = $(`#row-${rowId}-col-${colId - 1}`);
    let rightCell = $(`#row-${rowId}-col-${colId + 1}`);

    return [topCell, bottomCell, leftCell, rightCell];
}
$(".input-cell").click(function (e) {
    // console.log(this);
    let [rowId, colId] = getRowCell(this);

    let [topCell, bottomCell, leftCell, rightCell] = getTopLeftBottomRightCell(rowId, colId);

    if ($(this).hasClass("selected") && e.ctrlKey) {
        unselectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    }
    else {
        selectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    }

})

function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if (e.ctrlKey) {
        let topSelected;
        if (topCell) {
            topSelected = topCell.hasClass("selected"); //True or False
        }

        let bottomSelected;
        if (bottomCell) {
            bottomSelected = bottomCell.hasClass("selected");
        }

        let leftSelected;
        if (leftCell) {
            leftSelected = leftCell.hasClass("selected");
        }

        let rightSelected;
        if (rightCell) {
            rightSelected = rightCell.hasClass("selected");
        }

        if (topSelected) {
            $(ele).addClass("top-selected");
            topCell.addClass("bottom-selected");
        }

        if (bottomSelected) {
            $(ele).addClass("bottom-selected");
            bottomCell.addClass("top-selected");
        }

        if (leftSelected) {
            $(ele).addClass("left-selected");
            leftCell.addClass("right-selected");
        }

        if (rightSelected) {
            $(ele).addClass("right-selected");
            rightCell.addClass("left-selected");
        }
    }
    else {
        $(".input-cell.selected").removeClass("selected");
    }
    $(ele).addClass("selected");
    //console.log(this);

    changeHeader(getRowCell(ele)); // getRowCell will bring array
}

function changeHeader([rowId, colId]) {
    //console.log(cellData);
    let data;
    if(cellData[selectedSheet][rowId] && cellData[selectedSheet][rowId][colId])
    {
        data = cellData[selectedSheet][rowId][colId];
    }
    else {
        data = defaultProperties;
    }
    // to set alignment highliter in header according to selected cell alingment
    // let data = cellData[rowId][colId];
     $(".alignment.selected").removeClass("selected");
     $(`.alignment[data-type=${data.alignment}]`).addClass("selected");

    // //to set bold highlighter in header according to selected cell 
    // //But this makes code repetetive if we want to write this for italic and underline
    // // so we use function
    // // if(data.bold)
    // // {
    // //     console.log(data.bold);
    // //     $("#bold").addClass("selected");
    // // }
    // // else {
    // //     console.log("hello2");
    // //     $("#bold").removeClass("selected");
    // // }
    addRemoveSelectFromStyle(data, "bold");
    addRemoveSelectFromStyle(data, "italic");
    addRemoveSelectFromStyle(data, "underlined");

    $("#fill-color").css("border-bottom", `4px solid ${data.bgcolor}`);
    $("#text-color").css("border-bottom", `4px solid ${data.color}`);

    $("#font-family").val(data["font-family"]);
    $("#font-size").val(data["font-size"]);
    $("#font-family").css("font-family", data["font-family"]); // to make font-family inner text also look like font-family e.g calibri look like calibri not NotoSans
}

function addRemoveSelectFromStyle(data, property) {
    if (data[property]) {
        $(`#${property}`).addClass("selected");
    }
    else {
        $(`#${property}`).removeClass("selected");
    }
}

function unselectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if ($(ele).attr("contenteditable") == "false") {
        if ($(ele).hasClass("top-selected")) {
            topCell.removeClass("bottom-selected");
        }

        if ($(ele).hasClass("bottom-selected")) {
            bottomCell.removeClass("top-selected");
        }

        if ($(ele).hasClass("left-selected")) {
            leftCell.removeClass("right-selected");
        }

        if ($(ele).hasClass("right-selected")) {
            rightCell.removeClass("left-selected");
        }

        $(ele).removeClass("selected top-selected bottom-selected left-selected right-selected");
    }

}
let count = 0;
let startcellStarted = false;
let startCell = {};
let endCell = {};
let scrollXRStarted = false;
let scrollXLStarted = false;
$(".input-cell").mousemove(function (e) {
    //console.log(this);// prints all the mouse movement co-ordinates
    //console.log(e);

    e.preventDefault();
    if (e.buttons == 1) {

        if (e.pageX > ($(window).width() - 10) && scrollXRStarted == false) {
            // scrollLeft lets you set how many pixels the horizontal scrollbar must move in pixels
            //$("#cells").scrollLeft($("#cells").scrollLeft() + 100);
            scrollXR();
        }
        else if (e.pageX < 10 && scrollXLStarted == false) {
            scrollXL();
        }
        if (startcellStarted == false) {
            
            let [rowId, colId] = getRowCell(this);
            startCell = { "rowId": rowId, "colId": colId };
            selectAllBetweenCells(startCell, startCell);
            startcellStarted = true;
            $(".input-cell.selected").attr("contenteditable","false");
            //console.log(startcell);
        }
        // else {
        // Code moved inside mouseenter this saves overload of calling selectAllBetweenCells multiple times with 
        // mousemove 
        //     let [rowId,colId] = getRowCell(this); 
        //     endCell = {"rowId": rowId, "colId": colId};
        //     selectAllBetweenCells(startCell,endCell);
        // }
    }
    else {
        startcellStarted = false;
    }

})

// mouseenter only gets called when pointer moves from one cell to another
$(".input-cell").mouseenter(function (e) {
    if (e.buttons == 1) {
        if (e.pageX < ($(window).width() - 10) && scrollXRStarted) {
            clearInterval(scrollXRInterval);
            scrollXRStarted = false;

        }

        if (e.pageX > 10 && scrollXLStarted) {
            clearInterval(scrollXRInterval);
            scrollXLStarted = false;
        }
        let [rowId, colId] = getRowCell(this);
        endCell = { "rowId": rowId, "colId": colId };
        selectAllBetweenCells(startCell, endCell);
    }
})

function selectAllBetweenCells(start, end) {
    //console.log(count++);
    $(".input-cell.selected").removeClass("selected top-selected bottom-selected left-selected right-selected");
    for (let i = Math.min(start.rowId, end.rowId); i <= Math.max(start.rowId, end.rowId); i++) {

        for (let j = Math.min(start.colId, end.colId); j <= Math.max(start.colId, end.colId); j++) {

            let [topCell, bottomCell, leftCell, rightCell] = getTopLeftBottomRightCell(i, j);
            selectCell($(`#row-${i}-col-${j}`)[0], { "ctrlKey": true }, topCell, bottomCell, leftCell, rightCell);
        }
    }
}

let scrollXRInterval;
function scrollXR() {
    //console.log("hello");
    scrollXRStarted = true;
    scrollXRInterval = setInterval(() => {
        console.log("hello");
        $("#cells").scrollLeft($("#cells").scrollLeft() + 100);
    }, 100);
}

let scrollXLInterval;
function scrollXL() {
    scrollXLStarted = true;
    scrollXLInterval = setInterval(() => {
        // console.log("hello");
        $("#cells").scrollLeft($("#cells").scrollLeft() - 100);
    }, 100);
}

$(".data-container").mousemove(function (e) {
    e.preventDefault();
    if (e.buttons == 1) {
        if (e.pageX > ($(window).width() - 10) && scrollXRStarted == false) {
            // scrollLeft lets you set how many pixels the horizontal scrollbar must move in pixels
            //$("#cells").scrollLeft($("#cells").scrollLeft() + 100);
            scrollXR();
        }
        else if (e.pageX < 10 && scrollXLStarted == false) {
            scrollXL();
        }
    }
});


$(".data-container").mouseup(function (e) {
    clearInterval(scrollXRInterval);
    clearInterval(scrollXLInterval);
    scrollXRStarted = false;
    scrollXLStarted = false;
})

// How to make menu-icons work
$(".alignment").click(function (e) {
    let alignment = $(this).attr("data-type");
    $(".alignment.selected").removeClass("selected");
    $(this).addClass("selected");
    $(".input-cell.selected").css("text-align", alignment);

    // for all the selected cells we will add same alignment to all
    // $(".input-cell.selected").each(function(index,data){
    //     console.log(data);
    //     let[rowId,colId] = getRowCell(data);
    //     //console.log(rowId,colId);
    //     //console.log(cellData[rowId][colId]);
    //     cellData[rowId][colId].alignment = alignment;
    //     //console.log(cellData[rowId][colId]);
    // })
    // ------------we have moved this code to updateCellData function
    // if (alignment != left) {
    //     $(".input-cell.selected").each(function (index, data) {
    //         let [rowId, colId] = getRowCell(data);
    //         console.log(rowId, colId);

    //         if (cellData[selectedSheet][rowId] == undefined) {
    //             cellData[selectedSheet][rowId] = {};
    //             cellData[selectedSheet][rowId][colId] = { ...defaultProperties };
    //             cellData[selectedSheet][rowId][colId].alignment = alignment;
    //         }
    //         else {
    //             if (cellData[selectedSheet][rowId][colId] == undefined) {
    //                 cellData[selectedSheet][rowId][colId] = { ...defaultProperties };
    //                 cellData[selectedSheet][rowId][colId].alignment = alignment;
    //             }
    //             else {
    //                 cellData[selectedSheet][rowId][colId].alignment = alignment;
    //             }
    //         }
    //     });
    // }
    // else {
    //     $(".input-cell.selected").each(function (index, data) {
    //         let [rowId, colId] = getRowCell(data);
    //         if (cellData[selectedSheet][rowId][colId] != undefined) {
    //             cellData[selectedSheet][rowId][colId].alignment = alignment;
    //             // After giving alignment check whether the selected input cell prop became equaal to default properties
    //             if (JSON.stringify(cellData[selectedSheet][rowId][colId]) == JSON.stringify(defaultProperties)) {
    //                 delete cellData[selectedSheet][rowId][colId];
    //             }

    //         }
    //     });
    // }
    updateCellData("alignment",alignment);
})

$("#bold").click(function (e) {
    // This code becomes Repetetive so instead we use function setStyle
    // if($(this).hasClass("selected"))
    // { //remove bold
    //     $(this).removeClass("selected");
    //     $(".input-cell.selected").css("font-weight","");
    //     $(".input-cell.selected").each(function(index,data){
    //         let [rowId,colId] = getRowCell(data);
    //         // make cell data unbold
    //         cellData[rowId][colId].bold = false;
    //     })
    // }
    // else { // add bold
    //     $(this).addClass("selected");
    //     $(".input-cell.selected").css("font-weight","bold");
    //     $(".input-cell.selected").each(function(index,data){
    //         let [rowId,colId] = getRowCell(data);
    //         //make cell data bold
    //         cellData[rowId][colId].bold = true;

    //     })

    // }

    setStyle(this, "bold", "font-weight", "bold");
})

$("#italic").click(function (e) {
    setStyle(this, "italic", "font-style", "italic");
})

$("#underlined").click(function (e) {
    setStyle(this, "underlined", "text-decoration", "underline");
})

function setStyle(ele, property, key, value) {
    console.log(property)
    if ($(ele).hasClass("selected")) {
        $(ele).removeClass("selected");
        $(".input-cell.selected").css(key, "");
        // $(".input-cell.selected").each(function (index, data) {
        //     let [rowId, colId] = getRowCell(data);

        //     cellData[rowId][colId][property] = false;
        // })
        updateCellData(property,false);
    }
    else {
        $(ele).addClass("selected");
        $(".input-cell.selected").css(key, value);
        // $(".input-cell.selected").each(function (index, data) {
        //     let [rowId, colId] = getRowCell(data);

        //     cellData[rowId][colId][property] = true;
        // })
        updateCellData(property,true);
    }
}

$(".pick-color").colorPick({
    'intialColor': "#abcd",
    'allowRecent': true,
    'recentMax': 5,
    'allowCustomColor': true,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function () {
        //this.element.css({'backgroundColor': this.color, 'color': this.color});

        if (this.color != "#ABCD") {
            if ($(this.element.children()[1]).attr("id") == "fill-color") {
                $(".input-cell.selected").css("background-color", this.color);
                $("#fill-color").css("border-bottom", `4px solid ${this.color}`);

                //store the cell information
                // $(".input-cell.selected").each((index, data) => {
                //     let [rowId, colId] = getRowCell(data);

                //     cellData[rowId][colId].bgcolor = this.color;
                // })
                updateCellData("bgcolor",this.color);
            }

            if ($(this.element.children()[1]).attr("id") == "text-color") {
                $(".input-cell.selected").css("color", this.color);
                $("#text-color").css("border-bottom", `4px solid ${this.color}`);

                // $(".input-cell.selected").each((index, data) => {
                //     let [rowId, colId] = getRowCell(data);

                //     cellData[rowId][colId].color = this.color;
                // })
            }

            updateCellData("color",this.color);
        }

    }
});

$("#fill-color").click(function (e) {
    setTimeout(() => {
        $(this).parent().click();
    }, 10);
})

$("#text-color").click(function (e) {
    setTimeout(() => {
        $(this).parent().click();
    }, 10);
})

$(".menu-selector").change(function (e) {
    let value = $(this).val();// this will give font-size but number will be in string format
    let key = $(this).attr("id");
    if (key == "font-family") {
        $("#font-family").css(key, value);
    }
    if (!isNaN(value)) {
        // isNaN gives false if value can be converted to number
        //   isNaN gives true if value cannot be converted to number
        value = parseInt(value);
    }

    $(".input-cell.selected").css(key, value);

    // $(".input-cell.selected").each(function (index, data) {
    //     let [rowId, colId] = getRowCell(data);

    //     cellData[rowId][colId][key] = value;
    // })

    updateCellData(key,value);
})

function updateCellData(property,value)
{
    let currCellData = JSON.stringify(cellData);
    if (value != defaultProperties[property]) {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCell(data);
            //console.log(rowId, colId);

            if (cellData[selectedSheet][rowId] == undefined) {
                cellData[selectedSheet][rowId] = {};
                cellData[selectedSheet][rowId][colId] = { ...defaultProperties, "upStream": [], "downStream":[] }; // copy default properties to input-cell object
                cellData[selectedSheet][rowId][colId][property] = value;
            }
            else {
                if (cellData[selectedSheet][rowId][colId] == undefined) {
                    cellData[selectedSheet][rowId][colId] = { ...defaultProperties, "upStream": [], "downStream":[]  };
                    cellData[selectedSheet][rowId][colId][property] = value;
                }
                else {
                    cellData[selectedSheet][rowId][colId][property] = value;
                }
            }
        });
    }
    else {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCell(data);
            if ( cellData[selectedSheet][rowId] && cellData[selectedSheet][rowId][colId]) {
                cellData[selectedSheet][rowId][colId][property] = value;
                // After giving alignment check whether the selected input cell prop became equaal to default properties
                if (JSON.stringify(cellData[selectedSheet][rowId][colId]) == JSON.stringify(defaultProperties)) {
                    delete cellData[selectedSheet][rowId][colId];

                    //delete rowId as well
                    if(Object.keys(cellData[selectedSheet][rowId].length == 0))
                    {
                        delete cellData[selectedSheet][rowId];
                    }
                }

            }
        });
    }

    if(saved && currCellData != JSON.stringify(cellData))
    {
        saved = false;
    }
}

// $(".sheet-tab").on("contextmenu",function(e){
//     // whenever right click is pressed this function will run
//     // how does it know it is right click-> when context menu is opened means it is right click
//     console.log("hello");
//     e.preventDefault();
//     $(".sheet-options-modal").remove();

//     let modal = $(` <div class="sheet-options-modal">
//                         <div class="options sheet-rename">Rename</div>
//                         <div class="options sheet-delete">Delete</div>
//                     </div>`);
//     $(".container").append(modal);
//     modal.css({"left": e.pageX});// give some css to modal
// })
// when new sheets are attached or clicked then everytime we do this eventlisteners gets added to sheet-tab multiple times
// to avoid this we use addEvents function which will add events only to selected sheet


// when we click inside the container anywhere the rename-delete modal must disappear
$(".container").click(function(e){
    $(".sheet-options-modal").remove();
})

function addSheetEvents(){
    $(".sheet-tab.selected").on("contextmenu",function(e){
        // whenever right click is pressed this function will run
        // how does it know it is right click-> when context menu is opened means it is right click
        //console.log("hello");
        e.preventDefault();
       // if the sheet is already selected and we click on the same sheet again then selectsheet() function in called once again so to avoid
        // this we place it in if clause so when we select new sheet only at that time selectsheet function will be called
        // ! means it does not have(!hasClass)
        if(!$(this).hasClass("selected"))
        {
            $(".sheet-tab.selected").removeClass("selected"); // whichever sheet has selected class remove it
            $(this).addClass("selected");// and selected class to new clicked sheet
            selectSheet();
        }
        //selectSheet(this);
        $(".sheet-options-modal").remove();
    
        let modal = $(` <div class="sheet-options-modal">
                            <div class="options sheet-rename">Rename</div>
                            <div class="options sheet-delete">Delete</div>
                        </div>`);
        modal.css({"left": e.pageX});//open where we click                
        $(".container").append(modal);
        
        

        // ---------------------------------------
        // After modal appears when Rename button is clicked the followinf modal must open
        $(".sheet-rename").click(function(e){
            let renameModal = $(`<div class="sheet-modal-parent">
                                    <div class="sheet-rename-modal">
                                        <div class="sheet-modal-title">Rename Sheet</div>
                                        <div class="sheet-modal-input-container">
                                            <span class="sheet-modal-input-title">Rename Sheet to:</span>
                                            <input type="text" class="sheet-modal-input">
                                        </div>
                                        <div class="sheet-modal-confirmation">
                                            <div class="button yes-button">OK</div>
                                            <div class="button no-button">Cancel</div>
                                        </div>
                                    </div>
                                </div>`);
            $(".container").append(renameModal);
            $(".sheet-modal-input").focus();
            $(".no-button").click(function(e){
                $(".sheet-modal-parent").remove();
            })
            $(".yes-button").click(function(){
                renameSheet();
            })

            // when enter button is pressed on OK then also rename must work so do following
            $(".sheet-modal-input").keypress(function(e){
                if(e.key == "Enter")
                {
                    renameSheet();
                }
            })
        })

        $(".sheet-delete").click(function(e){

            if(totalSheets > 1){
                let deleteModal = $(`<div class="sheet-modal-parent">
                                        <div class="sheet-delete-modal">
                                            <div class="sheet-modal-title">${selectedSheet}</div>
                                            <div class="sheet-modal-detail-container">
                                                <span class="sheet-modal-detail-title">Are You Sure ?</span>
                                                
                                            </div>
                                            <div class="sheet-modal-confirmation">
                                                <div class="button yes-button">
                                                    <div class="material-icons delete-icon">delete</div>
                                                    Delete</div>
                                                <div class="button no-button">Cancel</div>
                                            </div>
                                        </div>
                                    </div>`);
                $(".container").append(deleteModal);
                $(".no-button").click(function(e){
                    $(".sheet-modal-parent").remove();
                })
                $(".yes-button").click(function(){
                    deleteSheet();
                })
            }
            else {
                // let timeout = `<div class="timeout-modal">
                //                     <span class="timeout">There is only one Sheet</span>
                //                 </div>`;
                // $(".container").append(timeout);
                // // setTimeout(()=>{
                //     $(".container").append(timeout);
                // },3000);
            }
           
        })

    })

    // when another sheet is clicked for selection
    $(".sheet-tab.selected").click(function(e){
        // if the sheet is already selected and we click on the same sheet again then selectsheet() function in called once again so to avoid
        // this we place it in if clause
        // ! means it does not have(!hasClass)
        if(!$(this).hasClass("selected"))
        {
            $(".sheet-tab.selected").removeClass("selected"); // whichever sheet has selected class remove it
            $(this).addClass("selected");// and selected class to new clicked sheet
            selectSheet();
        }
       
    })
}

addSheetEvents();

$(".add-sheet").click(function(e){
    saved = false;
    lastlyaddedSheet++;
    console.log(lastlyaddedSheet);
    totalSheets++;
    cellData[`Sheet${lastlyaddedSheet}`] = {}; // every sheet is object
    $(".sheet-tab.selected").removeClass("selected");
    $(".sheet-tab-container").append(`<div class="sheet-tab selected">Sheet${lastlyaddedSheet}</div>`);
    selectSheet();
    // when we are appending new sheet we are not attaching event listeners to it only the old sheet have eventListeners
    addSheetEvents();
    $(".sheet-tab.selected")[0].scrollIntoView();
})

// // when another sheet is clicked
// $(".sheet-tab").click(function(e){
//     $(".sheet-tab.selected").remove("selected");
//     $(this).addClass("selected");
//     selectSheet();
// })

// when new sheets are attached or clicked then everytime we do this eventlisteners gets added to sheet-tab multiple times
// to avoid this we use addEvents function which will add events only to selected sheet

function selectSheet(ele)
{
    if(ele && !$(ele).hasClass("selected"))
        {
            $(".sheet-tab.selected").removeClass("selected"); // whichever sheet has selected class remove it
            $(ele).addClass("selected");// and selected class to new clicked sheet
            // selectSheet();
        }
    emptyPreviousSheet();
    selectedSheet = $(".sheet-tab.selected").text(); // which sheet is selected
    loadCurrentSheet();
    $("#row-0-col-0").click();
}

function emptyPreviousSheet(){
    let data = cellData[selectedSheet];
    let rowkeys = Object.keys(data); // this will give us rows in array
    for(let i of rowkeys)
    {
     let rw = parseInt(i);
     let colkeys = Object.keys(data[rw]); // this will give all columns in that particular row
     for(let j of colkeys)
     {
         let cl = parseInt(j);
         let cell = $(`#row-${rw}-col-${cl}`);
         cell.text("");
         cell.css({
             "font-family": "NotoSans",
             "font-size": 14,
             "background-color": "#fff",
             "color":"#444",
             "font-weight": "",
             "font-style":"",
             "text-decoration":"",
             "text-align":"left"
         })
     }
    }
}

function loadCurrentSheet(){
    let data = cellData[selectedSheet];
    //console.log("hello");
    let rowkeys = Object.keys(data); // this will give us rows in array
    for(let i of rowkeys)
    {
     let rw = parseInt(i);
     let colkeys = Object.keys(data[rw]); // this will give all columns in that particular row
     for(let j of colkeys)
     {
         let cl = parseInt(j);
         let cell = $(`#row-${rw}-col-${cl}`);
         cell.text(data[rw][cl].text);
         cell.css({
             "font-family": data[rw][cl]["font-family"],
             "font-size": data[rw][cl]["font-size"],
             "background-color": data[rw][cl]["bgcolor"],
             "color":data[rw][cl].color,
             "font-weight": data[rw][cl].bold ? "bold": "",
             "font-style":data[rw][cl].italic ? "italic": "",
             "text-decoration":data[rw][cl].underlined ? "underline" : "",
             "text-align":data[rw][cl].alignment
         })
     }
    }
}

function renameSheet(){
    let newSheetName = $(".sheet-modal-input").val(); // work-1
    if(newSheetName && !Object.keys(cellData).includes(newSheetName))
    {
        saved = false;

        let newCellData = {}; // create new object

        // move the sheets to the newCellData object
        for(let i of Object.keys(cellData))
        {
            if( i == selectedSheet)
            {
                newCellData[newSheetName] = cellData[selectedSheet];
            }
            else {
                newCellData[i] = cellData[i];
            }
        }
        cellData = newCellData;
        selectedSheet = newSheetName;

        // cellData[newSheetName] = cellData[selectedSheet];
       
        // delete cellData[selectedSheet]; // deleted the variable not tthe object
        
        // selectedSheet = newSheetName;
      

        $(".sheet-tab.selected").text(newSheetName); // work-2

        $(".sheet-modal-parent").remove();//work-3

    }
    else {
        $(".rename-error").remove();// if the rename error is already there then remove that first to append new one
        $(".sheet-modal-input-container").append(`
            <div class="rename-error">Sheet Name is not valid or Sheet already exists</div>
        `)
    }
}

function deleteSheet(){
    $(".sheet-modal-parent").remove();
    let sheetIndex = Object.keys(cellData).indexOf(selectedSheet);
    let currentSelectedSheet = $(".sheet-tab.selected");
    //console.log(currentSelectedSheet);

    if(sheetIndex == 0)
    {
        selectSheet(currentSelectedSheet.next()[0]);
    }
    else {
        selectSheet(currentSelectedSheet.prev()[0]);
    }

    delete cellData[currentSelectedSheet.text()];
    currentSelectedSheet.remove();
    totalSheets--;
}

$(".left-scroller,.right-scroller").click(function(e){
    let keysArray = Object.keys(cellData);
    let selectedSheetIndex = keysArray.indexOf(selectedSheet);
    if(selectedSheetIndex != 0 && $(this).text() == "arrow_left")
    {
        selectSheet($(".sheet-tab.selected").prev()[0]);
    }
    else if(selectedSheetIndex != (keysArray.length - 1) && $(this).text() == "arrow_right")
    {
        selectSheet($(".sheet-tab.selected").next()[0]);
    }

    $(".sheet-tab.selected")[0].scrollIntoView();
})

$("#file").click(function(e){

    let fileModal = $(`<div class="file-modal">
                            <div class="file-options-modal">
                                <div class="close">
                                    <div class="material-icons close-icon">arrow_circle_down</div>
                                    <div>Close</div>
                                </div>
                                <div class="new">
                                    <div class="material-icons new-icon">insert_drive_file</div>
                                    <div>New</div>
                                </div>
                                <div class="open">
                                    <div class="material-icons open-icon">folder_open</div>
                                    <div>Open</div>
                                </div>
                                <div class="save">
                                    <div class="material-icons save-icon">save</div>
                                    <div>Save</div>
                                </div>
                            </div>
                            <div class="file-recent-modal"></div>
                            <div class="file-transparent"></div>
                        </div>`);
    $(".container").append(fileModal);
    fileModal.animate({
        width: "100vw"
    },300);

    $(".close,.file-transparent,.new,.save,.open").click(function(e){
        fileModal.animate({
            width: "0vw"
        },300);

        setTimeout(()=>{
            fileModal.remove();// since it is wrapped in $ and the object is saved in fileModal variable we can use remove function on it directly 
        },180) 
    });

    $(".new").click(function(e){
        if(saved)
        {
            newFile();
        }
        else {
            $(".container").append(`<div class="sheet-modal-parent">
                                        <div class="sheet-delete-modal">
                                            <div class="sheet-modal-title">${$(".title").text()}</div>
                                            <div class="sheet-modal-detail-container">
                                                <span class="sheet-modal-detail-title">Do you want to save changes?</span>
                                                
                                            </div>
                                            <div class="sheet-modal-confirmation">
                                                <div class="button yes-button">Yes</div>
                                                <div class="button no-button">No</div>
                                            </div>
                                        </div>
                                    </div>`);
            $(".yes-button").click(function(e){
                //save function
                $(".sheet-modal-parent").remove();
                saveFile(true);
                
            })
            $(".no-button").click(function(e){
                
                $(".sheet-modal-parent").remove();
              
                newFile();
            })
        }
    });
    $(".save").click(function(e){
        if(saved == false)
        {
            saveFile();
        }
       
    })
    $(".open").click(function(){
        openFile();
    })
})

function newFile(){
    emptyPreviousSheet();
    cellData = { "Sheet1":{}};

    $(".sheet-tab").remove();
    $(".sheet-tab-container").append(`<div class="sheet-tab selected">Sheet1</div>`);
    addSheetEvents();
    selectedSheet="Sheet1";
    totalSheets = 1;
    lastlyaddedSheet = 1;
    $(".title").text("Excel - Book");
    $("#row-0-col-0").click();
}

function saveFile(newClicked)
{
    
    $(".container").append(`<div class="sheet-modal-parent">
                                <div class="sheet-rename-modal">
                                    <div class="sheet-modal-title">Save File</div>
                                    <div class="sheet-modal-input-container">
                                        <span class="sheet-modal-input-title">File Name:</span>
                                        <input type="text" value="${$(".title").text()}" class="sheet-modal-input" />
                                    </div>
                                    <div class="sheet-modal-confirmation">
                                        <div class="button yes-button">OK</div>
                                        <div class="button no-button">Cancel</div>
                                    </div>
                                </div>
                            </div>`);
    
    $(".yes-button").click(function(e){
        $(".title").text($(".sheet-modal-input").val());
        let a = document.createElement("a");
        a.href = `data:application/json,${encodeURIComponent(JSON.stringify(cellData))}`;
        a.download = $(".title").text() + ".json";
        $(".container").append(a);
        a.click();
        saved = true;
    })
    $(".no-button,.yes-button").click(function(e){
        $(".sheet-modal-parent").remove();
        if(newClicked)
        {
            newFile();
        }
       
    })
}

function openFile()
{
    let inputFile = $(`<input accept="application/json" type = "file"/>`);
    $(".container").append(inputFile);
    inputFile.click();
    inputFile.change(function(e){
        // console.log(e);
        let file = e.target.files[0];// The file gets stored on file variable
        // console.log(file);
        $(".title").text(file.name.split(".json")[0]);
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            //console.log(reader.result);
            // reader.result stores the data

            emptyPreviousSheet();
            $(".sheet-tab").remove();
            cellData = JSON.parse(reader.result);
            let keys = Object.keys(cellData);
            lastlyaddedSheet = 0;
            for(let i of keys)
            {
                if(i.includes("Sheet"))
                {
                    let splittedSheetArray = i.split("Sheet");
                    if(splittedSheetArray.length == 2  && !isNaN(splittedSheetArray[1]))
                    {
                        lastlyaddedSheet = parseInt(splittedSheetArray[1]);
                    }
                }
                $(".sheet-tab-container").append(`<div class="sheet-tab selected">${i}</div>`);
            }
            addSheetEvents();
            $(".sheet-tab").removeClass("selected");
            $($(".sheet-tab")[0]).addClass("selected");
            selectedSheet = keys[0];
            totalSheets = keys.length;
           
            //console.log(lastlyaddedSheet);
            loadCurrentSheet();
            inputFile.remove();
            
        }
    })
}

let clipboard = {startCell: [], copyData: {}}; // copyData object is same as cellData object
let contentCutted = false;

$("#copy,#cut").click(function(e){

    // to check if cut was clicked or not
    if($(this).text() == "content_cut")
    {
        contentCutted = true;
    }

    // everytime we copy some data old clipboard data must be cleared so for that we declare clipboard everytime copy function is called
    clipboard = {startCell: [], copyData: {}};

    let [rowId,colId] = getRowCell($(".input-cell.selected")[0]);

    clipboard.startCell = [rowId,colId];

    $(".input-cell.selected").each(function(index,data){
        let [rowId,colId] = getRowCell(data);// get rowId and colId for each cell

        //check if in cellData there any changes which happened
        if(cellData[selectedSheet][rowId] && cellData[selectedSheet][rowId][colId])
        {
            // if that row and col exixtx which are changed hen copy it to clipboard copyData object
            if(!clipboard.copyData[rowId])
            {
                clipboard.copyData[rowId] = {};// make row 
            }
            //if row already exists then make column and copy the data
            clipboard.copyData[rowId][colId] = {...cellData[selectedSheet][rowId][colId]};
        }
    });
    console.log(clipboard);
})

$("#paste").click(function(e){
    if(contentCutted)
    {
        emptyPreviousSheet();
    }
    let startCell = getRowCell($(".input-cell.selected")[0]);// this startcell is where the first click happened for copying

    let rows = Object.keys(clipboard.copyData);

    for(let i of rows)
    {
        let cols = Object.keys(clipboard.copyData[i]);
        for(let j of cols)
        {
            if(contentCutted)
            {
                delete cellData[selectedSheet][i][j];
                console.log(cellData);
                if(Object.keys(cellData[selectedSheet][i]).length == 0)
                {
                    delete cellData[selectedSheet][i];
                }
            }
        }
    }
    
    for(let i of rows)
    {
        let cols = Object.keys(clipboard.copyData[i]);
        for(let j of cols)
        {
            let rowDistance = parseInt(i) - parseInt(clipboard.startCell[0]);
            let colDistance = parseInt(j) - parseInt(clipboard.startCell[1]);

            //now we want to ccopy from clipboard to cellData
            // so check if row exists in cellData
            if(!cellData[selectedSheet][startCell[0] + rowDistance])
            {
                cellData[selectedSheet][startCell[0] + rowDistance] = {};// make that row exixtx if doesnt
            }
            // if row exists and col doesn't then make col exixtx and copy clipboard col data to cellDatas col
            cellData[selectedSheet][startCell[0] + rowDistance][startCell[1] + colDistance] = {...clipboard.copyData[i][j]};
        }
    }
    //after copying all the data from clipboard to cellData the data is only stored in celldata it is not visible on UI
    // to make it visible call loadCurrentSheet function
    loadCurrentSheet();
    if(contentCutted)
    {
        contentCutted = false;
        clipboard = {startCell: [], copyData: {}};
    }
})

$("#formula-input").blur(function(e){
    if($(".input-cell.selected").length > 0)
    {
        let formula = $(this).text();
        let tempElements = formula.split(" ");
        console.log(tempElements);
        let elements = [];

        for(let i of tempElements)
        {
            if(i.length >= 2)
            {
               i = i.replace("(","");
                i = i.replace(")","");

                //Also if same ele are not present in formula then only push in elements array else push only once
                if(!elements.includes(i))
                {
                    elements.push(i);
                }
                
            }
        }
        // console.log(elements);
        $(".input-cell.selected").each(function(index,data){
            if(updateStreams(data,elements))
            {
    
            }
            else{
                alert("Formula is not valid");
            }
        })
       
    }
    else {
        alert("Please select a cell first");
    }
});

//function to calculate upstream and downstream
function updateStreams(ele, elements)
{
    let [rowId,colId] = getRowCell(ele);
    //console.log(colId);
    //console.log(`column-${colId+1}`);
    let selfColCode = $(`.column-${colId+1}`).attr("id");
    //console.log(selfColCode + (rowId+1));

    //if selfColCode is inside elements array then return false we can use that formula because that elem itself is present in elements formula calculation
    if(elements.includes(selfColCode + (rowId+1)))
    {
        console.log("hello");
         return false;
    }

    // if row is not present means col also will not exists if col not exists means upstream will not be present in that cell so update it
    if(!cellData[selectedSheet][rowId])
    {
        cellData[selectedSheet][rowId] = {};//make row exists
        // make col exists as well as update cellData
        cellData[selectedSheet][rowId][colId] = {...defaultProperties, "upStream": [...elements], "downStream": []};

    }
    else if(!cellData[selectedSheet][rowId][colId])
    { 
        cellData[selectedSheet][rowId][colId] = {...defaultProperties, "upStream": [...elements], "downStream": []};
    }
    else{
        //before placing elements directly in cellData first we should check that whether self's downstream contains elementsArray data
        let downStream = cellData[selectedSheet][rowId][colId].downStream;//get the downStream array
        for(let i of downStream)
        {
            if(elements.includes(i))
            {
                return false;
            }
        }

        // Also next check if formula is updated then traverse on cells upstream pick elementsArray elem one by one
        // go to their downstream and delete it from their
        let upStream = cellData[selectedSheet][rowId][colId].upStream;
        console.log(upStream);
        for(let i of upStream)
        {
            let [calRowId,calColId] = codeToValue(i);
            let index = cellData[selectedSheet][calRowId-1][calColId-1].downStream.indexOf(selfColCode + (rowId+1));
            cellData[selectedSheet][calRowId-1][calColId-1].downStream.splice(index,1);

            //it may happen that cell properties become equal to default properties so delete that cell
            if(JSON.stringify(cellData[selectedSheet][calRowId-1][calColId-1]) == JSON.stringify(defaultProperties))
            {
                delete cellData[selectedSheet][calRowId-1][calColId-1];
                //it may happen that entire row may become empty then delete that row
                if(Object.keys(cellData[selectedSheet][calRowId-1]).length == 0)
                {
                    delete cellData[selectedSheet][calRowId-1];
                }
            }
        }

        
        cellData[selectedSheet][rowId][colId].upStream = [...elements];
    }

    for(let i of elements)
    {
       let [calRowId, calColId] = codeToValue(i);
       if(!cellData[selectedSheet][calRowId - 1])
       {
            cellData[selectedSheet][calRowId - 1] = {};
            cellData[selectedSheet][calRowId - 1][calColId - 1] = {...defaultProperties, "upStream": [], "downStream": [selfColCode + (rowId+1)]}
       }
       else if (!cellData[selectedSheet][calRowId - 1][calColId - 1] )
       {
            cellData[selectedSheet][calRowId - 1][calColId - 1] = {...defaultProperties, "upStream":[], "downStream": [selfColCode + (rowId+1)]}; 
       }
       else {
           if(!cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.includes(selfColCode+(rowId+1)) )
           {
            cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.push(selfColCode+(rowId+1));
           }
       }
    }

    console.log(cellData);
    return true; // if ele is not in elements array then return true
}

function codeToValue(code)
{
    let colCode = "";
    let rowCode = "";

    for(let i = 0; i < code.length; i++)
    {
        if(!isNaN(code.charAt(i)))
        {
            rowCode += code.charAt(i);// it will store characters
        }
        else {
            colCode += code.charAt(i);//it will store numbers
        }
    }
    let colId = parseInt($(`#${colCode}`).attr("class").split(" ")[1].split("-")[1]);
    //console.log(colId);
    let rowId = parseInt(rowCode);
    //console.log(rowId);
    return [rowId,colId];
}



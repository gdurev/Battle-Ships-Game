
const   //Table dimensions
        T_ROWS = 10,
        T_COLUMNS = 10,

        //Ships
        SHIPS = [
            {
                name: "Destroyer",
                length: 4,
                count: 2
            },
            {
                name : "BattleShip",
                length: 5,
                count: 1
            }
            ],

        //Shot html values
        SHOT_NONE_VALUE = "&sdot;",
        SHOT_MISS_VALUE = "&mdash;",
        SHOT_HIT_VALUE = "X",

        //Position values
        POS_EMPTY = 0,
        POS_HIT = 1,
        POS_MISSED_ALREADY = 2,
        POS_HIT_ALREADY = 3,

        //Orientations
        OR_HORIZONTAL = "horizontal",
        OR_VERTICAL = "vertical",

        //HTML IDs & Classes
        ID_HEADER = "cellsHeader",
        ID_TABLE = "container",
        ID_FINISH = "gameFinished",
        CLASS_COORDINATES = "coords",
        CLASS_HIT = "hit",
        CLASS_MISSED = "missed",
        ID_COORDINATES_INPUT = "inputCoord",
        ID_OUTPUT = "output",
        ID_SUBMIT = "submit",

        //Output messages
        ALERT_FINISHED = "Game finished already !!!",
        OUTPUT_MISSED = "*** Miss ***",
        OUTPUT_HIT = "*** HIT ***",
        OUTPUT_MISSED_ALREADY = "*** Missed already ***",
        OUTPUT_SUNK = "*** SUNK ***",
        OUTPUT_HIT_ALREADY = "*** Hit already ***",
        OUTPUT_ERROR = "*** Error ***";

let battleShips = createShips(),
    shipsPos = [],

    //Stats
    shotsFired = 0,
    shipsCount = 0,
    shipsSunk = 0,
    gameFinished = 0;

const tableArr = createTArray(),

      //Console output as per spec
      show = shipsTo2Dtext();

//Generate ship object in array
function createShips(){
    let shipsArr = [],
        idCount = 0;

    SHIPS.forEach( ship => {
        let temp = [];

        for(let i = 0; i < ship.count; i++){
            idCount += 1;

            temp = {
                id: idCount,
                name: ship.name,
                length: ship.length,
                orientation: "",
                row: 0,
                column: 0
            };

            shipsArr.push(temp);
        }
    }); 

    return shipsArr;
}

//Create Array table and populate ships
function createTArray() {
    const table = Array(T_ROWS).fill(0).map(() => Array(T_COLUMNS).fill(0));

    //Populate ships in array
    let overlap,
        temp;

    Object.keys(battleShips).forEach( ship => {
        ship = battleShips[ship];

        //update ships count
        shipsCount += 1;

        //Generate individual orientation
        ship.orientation = setOrientation();

        if (ship.orientation === OR_HORIZONTAL) {
            do {
                //Generate initial coordinates
                ship.column = (setStart(T_COLUMNS - ship.length));
                ship.row = setStart(T_ROWS);

                //Check for overlapping
                overlap = 0;
                for (let c = 0; c < ship.length; c++) {
                    if (table[ship.row - 1][ship.column + c - 1] === 1) {
                        overlap = 1;
                    }
                }
            } while (overlap === 1);

            //Set values to array
            temp = [];
            for (let c = 0; c < ship.length; c++) {
                table[ship.row - 1][ship.column + c - 1] = 1;

                temp.push(indexToChar(ship.row - 1) + (ship.column + c));
            }

            shipsPos.push(temp);
        } else { //vertical
            do {
                //Generate initial coordinates
                ship.row = (setStart(T_ROWS - ship.length));
                ship.column = setStart(T_COLUMNS);

                //Check for overlapping
                overlap = 0;
                for (let c = 0; c < ship.length; c++) {
                    if (table[ship.row + c - 1][ship.column - 1] === 1) {
                        overlap = 1;
                    }
                }
            } while (overlap === 1);

            //Set values
            temp = [];
            for (let c = 0; c < ship.length; c++) {
                table[ship.row + c - 1][ship.column - 1] = 1;
                temp.push(indexToChar(ship.row + c - 1) + (ship.column));
            }
            shipsPos.push(temp);
        }
    });

    generateHTMLtable();

    return table;
}

function generateHTMLtable(){
    //Create html table
    const table = document.createElement("table");

    for(let i = 0; i <= T_ROWS; i++) {

        const row = table.insertRow(i);

        //Create row columns
        for (let y = 0; y <= T_COLUMNS; y++) {
            if (i === 0 && y !== 0) {
                //Insert Columns Index
                const cell = row.insertCell(0);

                cell.innerHTML = T_COLUMNS - y + 1; //Index numbers in reversed order
                cell.id = ID_HEADER;
            } else if (y !== 0) {
                //Fill Columns Cells
                const cell = row.insertCell(y - 1);

                cell.innerHTML = SHOT_NONE_VALUE;
                cell.id = indexToChar(i - 1) + y;
                cell.className = CLASS_COORDINATES;
            }
        }

        if (i === 0){
            //Inser empty cell on 1,1
            const cell = row.insertCell(0);

            cell.id = ID_HEADER;
        } else {
            //Put first column letters
            const headerCell = row.insertCell(0);
            headerCell.innerHTML = indexToChar(i - 1);
            headerCell.id = ID_HEADER;
        }
    }

    //Fill html container
    const gameBoardContainer = document.getElementById(ID_TABLE);
    gameBoardContainer.appendChild(table);

    return null;
}

//Check coordinates on shot fired
function shotFired(shotCoord) {
    if(gameFinished === 1) {
        alert(ALERT_FINISHED);
        return null;
    }
    const output = document.getElementById(ID_OUTPUT);

    try {
        //Used with submit button?
        shotCoord === undefined ?
            shotCoord = document.getElementById(ID_COORDINATES_INPUT).value.trim()
            : null;

        //fix lowerCase
        if(shotCoord.charAt(0) !== shotCoord.charAt(0).toUpperCase()){
            shotCoord = shotCoord.charAt(0).toUpperCase() + shotCoord.slice(1);
        }

        let shotX = shotCoord.charAt(0).charCodeAt(0) - 64,
            shotY = shotCoord.slice(1),
            hitCount = 0;

        //STATS update shots fired
        shotsFired += 1;

        let thisCell = document.getElementById(shotCoord);

        switch(tableArr[shotX - 1][shotY - 1]) {
            case POS_EMPTY:
                thisCell.innerHTML = SHOT_MISS_VALUE;
                thisCell.className = CLASS_MISSED;

                output.innerHTML = OUTPUT_MISSED;

                //Set table array value to Miss
                tableArr[shotX - 1][shotY - 1] = 2;
                break;
            case POS_HIT:
                let text = OUTPUT_HIT;

                thisCell.innerText = SHOT_HIT_VALUE;
                thisCell.className = CLASS_HIT;

                //Set shot value to hit
                tableArr[shotX - 1][shotY - 1] = 3;

                //Check if the ship sunk
                ////Get array index by coordinates
                let arrIndex = null,
                    hitCount = 0;

                ////get array index of ships positions table
                for (let x in shipsPos) {
                    for (let y in shipsPos[x]) {
                        if (shotCoord === shipsPos[x][y]) {
                            arrIndex = x;
                        }
                    }
                }
                for (let x in shipsPos[arrIndex]) {
                    document.getElementById(shipsPos[arrIndex][x]).innerHTML === SHOT_HIT_VALUE ?
                        hitCount += 1
                        : null;
                }
                if (hitCount === shipsPos[arrIndex].length) {
                    text = OUTPUT_SUNK;

                    shipsSunk += 1;

                    //Game completed?
                    if (shipsCount === shipsSunk) {
                        document.getElementById(ID_FINISH).innerHTML =
                            "Well done! You completed the game in " + shotsFired + " shots !!!";

                        cleanEmptyCells();
                        gameFinished = 1;
                    }
                }
                //user output
                output.innerHTML = text;
                break;
            case POS_MISSED_ALREADY:
                output.innerHTML = OUTPUT_MISSED_ALREADY;
                break;
            case POS_HIT_ALREADY:
                output.innerHTML = OUTPUT_HIT_ALREADY;
                break;
            default:
                output.innerHTML = OUTPUT_ERROR;
        }
    }
    catch (error) {
        output.innerHTML = OUTPUT_ERROR;
    }
}

//Checking values on shots fired events
document.querySelectorAll("." + CLASS_COORDINATES).forEach( td => {
    td.addEventListener("click", () => { shotFired(td.id) });
});

//Input box on Enter key event
document.getElementById(ID_COORDINATES_INPUT)
    .addEventListener("keyup", e => {
        e.preventDefault();

        if (event.keyCode === 13) {
            document.getElementById(ID_SUBMIT).click();
        }
    });

//On Submit button event
document.getElementById(ID_SUBMIT)
    .addEventListener("click", e => {
        e.preventDefault();
        shotFired();
    });

function cleanEmptyCells(){
    const cleanTable = document.querySelectorAll("#" + ID_TABLE + " td")
    cleanTable.forEach( e => {
        e.innerHTML !== SHOT_HIT_VALUE && e.id !== ID_HEADER ?
            e.innerHTML = "" : null;
    });
}

//Get Char int for num
function indexToChar( i ) {
    return String.fromCharCode( i + 97 ).toUpperCase();
}

//Generate initial coordinates
function setStart(max) {
    return Math.floor(1 + Math.random()*(max+1 - 1));
}

//Generate orientation
function setOrientation() {
    const orientVar = Math.round(Math.random());

    return orientVar === 0 ? OR_HORIZONTAL : OR_VERTICAL;
}

//Show boats as per spec
function shipsTo2Dtext() {
    let txt = "";

    for(let i = 0; i < T_ROWS + 1; i++){
        if(i !== 0){
            //New line
            txt += "\n";
            //Row letter
            txt += indexToChar(i - 1);
        }
        for(let y = 0; y < T_COLUMNS + 1; y ++){
            if(i === 0 && y !== 0){
                //Column number
                txt += " " + y + " ";
            } else if (y !== 0){
                //Check for ship
                if(tableArr[i - 1][y - 1] === 1){
                    txt += " X ";
                } else {
                    txt += "   "
                }
            }
        }
    }

    return txt;
}
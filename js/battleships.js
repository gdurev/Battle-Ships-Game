//***************************
//BattleShips => {TechHuddle}
//***************************

const   rows = 10,
        cols = 10,
        noShotValue = "&sdot;",
        missValue = "&mdash;",
        hitValue = "X";


let battleShips = [
        Battleship = {
            length: 5,
            orientation: "",
            row: 0,
            column: 0
        },
        Destroyer = {
            length: 4,
            orientation: "",
            row: 0,
            column: 0
        },
        Destroyer = {
            length: 4,
            orientation: "",
            row: 0,
            column: 0
        }
    ],
    shipsPos = [],
    overlap = 0,
    temp = [],
    shotsFired = 0,
    shipsCount = 0,
    shipsSunk = 0,
    gameFinished = 0;

const tableArr = createTArray(rows, cols);

//Generate ships in array
Object.keys(battleShips).forEach((ship) => {
    ship = battleShips[ship];

    //update ships count
    shipsCount += 1;

    //Generate individual orientation
    ship.orientation = setOrientation();

    if (ship.orientation === "horizontal") {
        do {
            //Generate initial coordinates
            ship.column = (setStart(cols - ship.length));
            ship.row = setStart(rows);

            //Check for overlapping
            overlap = 0;
            for (let c = 0; c < ship.length; c++) {
                if (tableArr[ship.row - 1][ship.column + c - 1] === 1) {
                    overlap = 1;
                }
            }
        } while (overlap === 1);

        //Set values to array
        temp = [];
        for(let c = 0; c < ship.length; c++){
            tableArr[ship.row - 1][ship.column + c - 1] = 1;
            temp.push(indexToChar(ship.row - 1) + (ship.column + c));
        }

        shipsPos.push(temp);
    } else { //vertical
        do {
            //Generate initial coordinates
            ship.row = (setStart(rows - ship.length));
            ship.column = setStart(cols);

            //Check for overlapping
            overlap = 0;
            for (let c = 0; c < ship.length; c++) {
                if (tableArr[ship.row + c - 1][ship.column - 1] === 1) {
                    overlap = 1;
                }
            }
        } while (overlap === 1);

        //Set values
        temp = [];
        for(let c = 0; c < ship.length; c++){
            tableArr[ship.row + c - 1][ship.column - 1] = 1;
            temp.push(indexToChar(ship.row + c - 1 ) + (ship.column));
        }
        shipsPos.push(temp);

    }
});

//Create html table
const table = document.createElement("table");

for(let i = 0; i < tableArr.length; i++){
    const row = table.insertRow(i);

    //Create row columns
    for(let y = 0; y < tableArr[i].length; y++){
        const cell = row.insertCell(y);

        cell.innerHTML = noShotValue;
        cell.id = indexToChar(i) + (y  + 1);
        cell.className = "coords"
    }

    //Put first column letters
    const headerCell = row.insertCell(0);
    headerCell.innerHTML = indexToChar(i);
    headerCell.id = "cellsHeader";
}

//Put row header numbers
const headerRow = table.insertRow(0);
for(let i = 0; i < cols + 1; i ++){
    const cell = headerRow.insertCell(i);
    if(i !== 0) {
        cell.innerHTML = i;
        cell.id = "cellsHeader";
    }
}

//Fill html container
const gameBoardContainer = document.getElementById("container");
gameBoardContainer.appendChild(table);

//Checking values on shots fired events
document.querySelectorAll(".coords").forEach( td => {
    td.addEventListener("click", () => { shotFired(td.id) });
});

const input = document.getElementById("input");
input.addEventListener("submit", e => {
    e.preventDefault();

    shotFired();
});

function shotFired(shotCoord) {
    if(gameFinished === 1) {
        alert("Game finished already !!!");
        return null;
    }
    const output = document.getElementById("output");

    try {
        //Used with submit button?
        shotCoord === undefined ?
            shotCoord = document.getElementById("coord").value.trim()
            : null;

        //fix lowerCase
        if(shotCoord.charAt(0) !== shotCoord.charAt(0).toUpperCase()){
            shotCoord = shotCoord.charAt(0).toUpperCase() + shotCoord.slice(1);
        }

        let shotX = shotCoord.charAt(0).charCodeAt(0) - 65,
            shotY = shotCoord.slice(1),
            hitCount = "";

        //STATS update shots fired
        shotsFired += 1;

        let thisCell = document.getElementById(shotCoord);

        switch(tableArr[shotX][shotY - 1]) {

            //Shots ID legend:
            // 0 = Empty
            // 1 = Ship position
            // 2 = Already tried
            // 3 = Hit

            case 0:
                thisCell.innerHTML = missValue;
                thisCell.className = "missed";

                output.innerHTML = "*** Miss ***";

                //Set table array value to Miss
                tableArr[shotX][shotY - 1] = 2;
                break;
            case 1:
                let text = "*** HIT ***";

                thisCell.innerText = hitValue;
                thisCell.className = "hit";

                //Set shot value to hit
                tableArr[shotX][shotY - 1] = 3;

                //Get array index by coordinates
                let arrIndex = "",
                    hitCount = 0;

                ///get array index of ships positions table
                for (let x in shipsPos) {
                    for (let y in shipsPos[x]) {
                        if (shotCoord === shipsPos[x][y]) {
                            arrIndex = x;
                        }
                    }
                }
                ///check if the ship sunk
                for (let x in shipsPos[arrIndex]) {
                    document.getElementById(shipsPos[arrIndex][x]).innerHTML === hitValue ?
                        hitCount += 1
                        : null;
                }
                if (hitCount === shipsPos[arrIndex].length) {
                    text = "*** SUNK ***";

                    shipsSunk += 1;

                    //Game completed?
                    if (shipsCount === shipsSunk) {
                        document.getElementById("gameFinished").innerHTML =
                            "Well done! You completed the game in " + shotsFired + " shots !!!";

                        cleanEmptyCells();
                        gameFinished = 1;
                    }
                }

                //user output
                output.innerHTML = text;
                break;
            case 2:
                output.innerHTML = "*** Missed already ***";
                break;
            case 3:
                output.innerHTML = "*** Hit already ***";
                break;
            default:
                output.innerHTML = "*** Error ***";
        }


    }
    catch (error) {
        output.innerHTML = "*** Error ***"
    }

}

//Show boats as per spec
function show() {
    //Reveal by coordinates
    shipsPos.map( row => {
        row.map( cell => {
            document.getElementById(cell).innerText = hitValue;
        })
    });

    //Clean the rest of the table as per example
    cleanEmptyCells();

    return "You cheater!";
}


//Debugging
//console.table(shipsPos);
//console.table(tableArr);

function cleanEmptyCells(){
    const cleanTable = document.querySelectorAll("#container td")
    cleanTable.forEach( e => {
        e.innerHTML !== hitValue && e.id !== "cellsHeader" ?
            e.innerHTML = "" : null;
    });
}

function createTArray(rows, columns) {
    const table = Array(rows).fill(0).map(() => Array(columns).fill(0));

    return table;
}

//get Char int for num
function indexToChar( i ) {
    return String.fromCharCode( i + 97 ).toUpperCase();
}

//generate initial coordinates
function setStart(max) {
    return Math.floor(1 + Math.random()*(max+1 - 1));
}

//generate orientation
function setOrientation() {
    const orientVar = Math.round(Math.random());

    return orientVar === 0 ? orientation = "horizontal" : orientation = "vertical";
}
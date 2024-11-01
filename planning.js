const fs = require('fs');

// readCsv function gives back processed array of input file which is 2D array.
// also the header (1st line) is trimmed
function readCsv(filename, delimiter = ',') {
    try { 
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim(); 
            if (row) {
                const columns = row.split(delimiter);
                data.push(columns); 
            }
        }

        return data;
    } catch (err) { 
        console.error("Error reading file:", err.message);
        return null;
    }
}

// ----------------!data from CSV files into array of lines then into array of objects!---------------

// --AIRPORT DATA--
const airportsData = readCsv('airports.csv');
// process airportData 2D array into array of objects 
let airportOjects = airportsData.map(airport => {
    return {
        code : airport[0],//overseasairport code
        full_name : airport[1],
        distance_from_MAN : airport[2],
        distance_from_LGW : airport[3]
    };
});

// --AEROPLANES DATA--
const aeroplanesData = readCsv('aeroplanes.csv');
// process aeroplanesData 2D array into array of objects 
let aeroplanesOjects = aeroplanesData.map(aeroplane => {
    return {
        type : aeroplane[0],
        runningCostPerSeatPer100km : aeroplane[1].slice(1),
        maxFlightRangeKM : aeroplane[2],
        economySeats : aeroplane[3],
        businessSeats : aeroplane[4],
        firstclassSeats : aeroplane[5],
    };
});

// ----------------!validate the input data for aircaraft code, aircraft capacity & aircraft range!---------------

// VALIDATE AIRCRAFT CODE
function validateAirportCode(ukAirport, overseasAirport){
    const overseasAirportObj = airportOjects.find(airport => airport.code === overseasAirport);
        if (ukAirport !== "MAN" && ukAirport !== "LGW") {
            console.log(`Invalid airport code: ${ukAirport}`);
            return false; 
        } else if (!overseasAirportObj){
            console.log(`Invalid airport code: ${overseasAirport}`);
            return false; 
        }
    return true; 
}

// VALIDATE AIRCRAFT CAPACITY
function validateAircraftCapacity(economySeats, businessSeats, firstClassSeats, typeOfAircraft){
    const aeroplane = aeroplanesOjects.find(aeroplane => aeroplane.type === typeOfAircraft)
    const aeroplaneEconomyCapacity = aeroplane ? Number(aeroplane.economySeats) : 0;
    const aeroplaneBusinessCapacity = aeroplane ? Number(aeroplane.businessSeats) : 0;
    const aeroplaneFirstclassCapacity = aeroplane ? Number(aeroplane.firstclassSeats) : 0;

    const totalSeatsBooked = Number(economySeats) + Number(businessSeats) + Number(firstClassSeats);
    const totalSeatCapacity = aeroplaneEconomyCapacity + aeroplaneBusinessCapacity + aeroplaneFirstclassCapacity;

        if (economySeats > aeroplaneEconomyCapacity) {
            console.log(`Too many economy seats booked (${economySeats} > ${aeroplaneEconomyCapacity})`)
            return false; 
        } else if (businessSeats > aeroplaneBusinessCapacity){
            console.log(`Too many business seats booked (${businessSeats} > ${aeroplaneBusinessCapacity})`)
            return false; 
        } else if (firstClassSeats > aeroplaneFirstclassCapacity){
            console.log(`Too many business seats booked (${firstClassSeats} > ${aeroplaneFirstclassCapacity})`)
            return false; 
        } else if (totalSeatsBooked > totalSeatCapacity){
            console.log(`Too many total seats booked (${totalSeatsBooked} > ${totalSeatCapacity})`)
            return false; 
        }
    
    return true; 

}

// VALIDATE FLIGHT RANGE
function validateFlightRange(ukAirport, overseasAirport, typeOfAircraft){
    // calculate distance between airprots
    const distanceBetweenAirportsKm =  airportOjects.filter(airport => airport.code === overseasAirport)  //filter out the airport based on flight overseas Aiport code
        .map(airport => (ukAirport === "MAN") ? Number(airport.distance_from_MAN) : Number(airport.distance_from_LGW));   //based on ukAirport code select the correct distance either MAN or LGW

    // find aeroplane maxFlightRangeKM
    const aeroplane = aeroplanesOjects.find(aeroplane => aeroplane.type === typeOfAircraft); //find the aeroplane based on flight type code
    
    //  get flight range  of the flight type
    const flightRangeKm = aeroplane ? Number(aeroplane.maxFlightRangeKM) : 0;
    
    // check 
        if (distanceBetweenAirportsKm > flightRangeKm) {
            console.log(`Aircraft ${typeOfAircraft} doesn't have the range to fly to ${overseasAirport}`);
            return false; 
        }
    
    return true; 
}   

// ----------------!Functions to help calculate income & cost !---------------

function calculateFlightIncome(economySeats, priceEconomySeat, businessSeats, priceBusinessSeat, firstClassSeats, priceFirstClassSeat){
    // total income per flight from all 3 (economy + business + first class)
    return ((economySeats * priceEconomySeat) + 
        (businessSeats * priceBusinessSeat) + 
        (firstClassSeats * priceFirstClassSeat));
};


function calculateFlightCostPerSeat(ukAirport, overseasAirport, typeOfAircraft){
    // 1. calculate distance between 2 airports 
    const distanceBetweenAirportsKm =  airportOjects.filter(airport => airport.code === overseasAirport)  //filter out the airport based on flight overseas Aiport code
        .map(airport => (ukAirport === "MAN") ? Number(airport.distance_from_MAN) : Number(airport.distance_from_LGW));   //based on ukAirport code select the correct distance either MAN or LGW
    
    
    //2. calculate total seats 
    const aeroplane = aeroplanesOjects.find(aeroplane => aeroplane.type === typeOfAircraft); //find the aeroplane based on flight type code
    
    //3. calculate cost per seat 
    //  get costPerSeatPer100km of the flight type
    const costPerSeatPer100km = aeroplane ? Number(aeroplane.runningCostPerSeatPer100km) : 0;   
    const costPerSeatPounds = ((distanceBetweenAirportsKm / 100) * costPerSeatPer100km).toFixed(2);

    return costPerSeatPounds
}

// ----------------!MAIN FUNCTION TO PROCESS OUTPUT to the SCREEN the details of the flight and the expected profit or loss for each flight.---------------
function ProcessData(flight_data_csv){
    const flightsData = readCsv(flight_data_csv);

    if (!flightsData || flightsData.length === 0) {
        console.error("Error: Empty or invalid flight data file.");
        return null;
    }

    // process flightsData 2D array into array of objects 
    let flightsOjects = flightsData.map(flight => {
        return {
            ukAirport : flight[0], // airport code
            overseasAirport : flight[1], //airport code
            typeOfAircraft : flight[2],
            noOfEconomySeatsBooked : flight[3],
            noOfBusinessSeatsBooked : flight[4],
            noOfFirstClassSeatsBooked : flight[5],
            PriceOfAEconomyClassSeat : flight[6],
            PriceOfABusinessClassSeat : flight[7],
            PriceOfAFirstClassSeat : flight[8].match(/\d+/)[0] //invalid_flight_data file has #error comments, filtering out the numbers only
        };
    });

    try {
        // outputTxtArray to store the processed data after transfomration/manupulation
        let outputTxtArray = [];

        // step 2: map through each line of flights data 
        // & output to be an array of objects - added extra columns of income, cost, profit
        flightsOjects.forEach(flight => {
            // validation of each flight before carrying out the calc. if validation false -> no calculation
            if (!validateAirportCode(flight.ukAirport, flight.overseasAirport)) return;
            if (!validateFlightRange(flight.ukAirport, flight.overseasAirport, flight.typeOfAircraft)) return; 
            if (!validateAircraftCapacity(flight.noOfEconomySeatsBooked, flight.noOfBusinessSeatsBooked, flight.noOfFirstClassSeatsBooked, flight.typeOfAircraft)) return;
            
            // step 2a: calculate income of flight
            let flightIncome = calculateFlightIncome(flight.noOfEconomySeatsBooked, flight.PriceOfAEconomyClassSeat,  
            flight.noOfBusinessSeatsBooked, flight.PriceOfABusinessClassSeat,  
            flight.noOfFirstClassSeatsBooked, flight.PriceOfAFirstClassSeat)
            
            // step 2b: calculate cost of flight
            let totalSeatsTaken =  Number(flight.noOfEconomySeatsBooked) + Number(flight.noOfBusinessSeatsBooked) + Number(flight.noOfFirstClassSeatsBooked)
            let flightCost = (calculateFlightCostPerSeat(flight.ukAirport, flight.overseasAirport, flight.typeOfAircraft)
                * totalSeatsTaken).toFixed(2);
            
            // step 2c: calculate profit
            let flightProfit = (flightIncome - flightCost).toFixed(2);

            // to print the full_name of the airporst
            const ukAirportName = (flight.ukAirport === "MAN") ? "Manchester" : "London Gatwick"
            const overseasAirportName = airportOjects.find(airport => airport.code === flight.overseasAirport).full_name;//find the airport/airport_name based on flight type code

            // print in console for client
            console.log(`£${flightIncome.toLocaleString('en-GB')} (income) - £${flightCost.toLocaleString('en-GB', { maximumSignificantDigits: 3 })} (cost) = £${flightProfit} The flight from ${ukAirportName} (${flight.ukAirport}) to (${flight.overseasAirport}) (${overseasAirportName}) using a ${flight.typeOfAircraft}, with the given seat bookings and prices, would result in a profit of £${flightProfit.toLocaleString('en-GB')}.`);
            console.log(' ')
            outputTxtArray.push((`£${flightIncome.toLocaleString('en-GB')} (income) - £${flightCost.toLocaleString('en-GB')} (cost) = £${flightProfit} The flight from ${ukAirportName} (${flight.ukAirport}) to (${flight.overseasAirport}) (${overseasAirportName}) using a ${flight.typeOfAircraft}, with the given seat bookings and prices, would result in a profit of £${flightProfit.toLocaleString('en-GB')}.`));
        });

        // console.table(outputArray)
        // console.log(outputTxtArray)
        return outputTxtArray;

    } catch (err) { 
        console.error(`Error processing flight: ${err.message}`);
        return null;
    }
}

// ----------------!Function to create .txt file from the processed data !---------------
function CreateTxtFile(outputTxtArray){
    // create .txt file with the. ouputs.
    const stringForTxtFile = outputTxtArray.join("\n") + "\n"
    if (fs.existsSync("outdata.txt")) {fs.unlinkSync("outdata.txt")};
    fs.appendFileSync("outdata.txt", stringForTxtFile)
}

// ----------------!CALL FUNCTION TO PROCESS DATA!--------------- 
// // --TEST VALID FLIGHT DATA--
const validData = 'valid_flight_data.csv';
let outputTxtArray = ProcessData(validData)
CreateTxtFile(outputTxtArray);

// --TEST INVALID FLIGHT DATA--
// const invalidData = 'invalid_flight_data.csv';
// let outputTxtArray = ProcessData(invalidData)
// CreateTxtFile(outputTxtArray);           


// own test 
module.exports = { 
    readCsv,
    validateAirportCode,
    validateAircraftCapacity,
    validateFlightRange,
    calculateFlightCostPerSeat,
    calculateFlightIncome,
    ProcessData,
    CreateTxtFile
 };

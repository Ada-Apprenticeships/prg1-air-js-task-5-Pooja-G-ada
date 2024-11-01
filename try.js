const fs = require('fs');

// this function gives back processes array of input file which is 2D array.
// also the header (1st line) is trimmed
function readCsv(filename, delimiter = ',') {
    try { //code in try block is executed first
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim(); //Remove whitespace from both sides of a string
            if (row) {
                const columns = row.split(delimiter);//splits a string into an array of substrings by separator 
                data.push(columns); //add each row of input file into empty array data
            }
        }

        return data;
    } catch (err) { //if an error occurs, code stops executing in the try block & immediately jumps to catch block.  catch block handles error allowing the program to continue smoothly without creaching!!
        console.error("Error reading file:", err.message);
        return null;
    }
}

// Usage example
// const airportsData = readCsv('airports.csv');
// if (airportsData) {
//     airportsData.forEach(row => {
//         console.log(row);
//         // console.table(row);
//     });
// }
// ----------------!data from CSV files as table!---------------
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
// console.table(airportOjects);
// --AEROPLANES DATA--
const aeroplanesData = readCsv('aeroplanes.csv');
// process aeroplanesData 2D array into array of objects 
// console.log(aeroplanesData);
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
// console.table(aeroplanesOjects);
// --VALID FLIGHT DATA--
const flightsData = readCsv('valid_flight_data.csv');
// const flightsData = readCsv('invalid_flight_data.csv');

// process flightsData 2D array into array of objects 
// console.log(flightsData);
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
        PriceOfAFirstClassSeat : flight[8]
    };
});
// console.table(flightsOjects);

// ----------------!output to the screen the details of the flight and the expected profit or loss for each flight.---------------

// ----------------!DATA FROM CSV FILE NEEDED FOR CALCULATION---------------
function distanceFromUkToOverseas(flightsOjects){
    let distanceFromUkToOverseas = []
    // loop through flights/Obj array 
    flightsOjects.forEach(flight => {
        // Find the overseas airport based on its(airport) code. loop through airport data to find the airport code
        const overseasAirport = airportOjects.filter(airport => airport.code === flight.overseasAirport)  
        // console.log(overseasAirport);
        // If the overseas airport is found, calculate the distance
        if (overseasAirport){
            const distanceBetweenAirportsKm = 
            overseasAirport.map(airport => (flight.ukAirport === "MAN") ? 
                airport.distance_from_MAN : 
                airport.distance_from_LGW);
            console.log(`Distance from ${flight.ukAirport} to ${flight.overseasAirport}: ${distanceBetweenAirportsKm} km`);
            return distanceBetweenAirportsKm;
        } 
    })
}

// ----------------!CALCULATE INCOME---------------
function calculateIncome(){
    let flightsIncome = []
    flightsOjects.forEach(flight => {
        // total income per flight from all 3 (economy + business + first class)
        let flightIncome = 
            ((flight.noOfEconomySeatsBooked * flight.PriceOfAEconomyClassSeat) + 
            (flight.noOfBusinessSeatsBooked * flight.PriceOfABusinessClassSeat) + 
            (flight.noOfFirstClassSeatsBooked * flight.PriceOfAFirstClassSeat));
        flightsIncome.push(flightIncome);
    });
    console.log(flightsIncome);
    return flightsIncome;
};

// call function 


try {
    // code to execute
    console.table(flightsOjects);
    distanceFromUkToOverseas(flightsOjects);
    calculateIncome();
} catch (err) { //if an error occurs, code stops executing in the try block & immediately jumps to catch block.  catch block handles error allowing the program to continue smoothly without creaching!!
    console.error("Error reading file:", err.message);
    return null;
}
// ----------------!CALCULATE COST---------------



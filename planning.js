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
            // throw new Error(`Invalid airport code: ${ukAirport} or ${overseasAirport}`);
            console.log(`Invalid airport code: ${ukAirport}`);
            return false; //validation unsuccessful
        } else if (!overseasAirportObj){
            console.log(`Invalid airport code: ${overseasAirport}`);
            return false; //validation unsuccessful
        }
    return true; //validation successful
}

// VALIDATE AIRCRAFT CAPACITY
function validateAircraftCapacity(economySeats, businessSeats, firstClassSeats, typeOfAircraft){
    // check economy seats 
    const aeroplane = aeroplanesOjects.find(aeroplane => aeroplane.type === typeOfAircraft)
    const aeroplaneEconomyCapacity = aeroplane ? Number(aeroplane.economySeats) : 0;
    const aeroplaneBusinessCapacity = aeroplane ? Number(aeroplane.businessSeats) : 0;
    const aeroplaneFirstclassCapacity = aeroplane ? Number(aeroplane.firstclassSeats) : 0;

    const totalSeatsBooked = Number(economySeats) + Number(businessSeats) + Number(firstClassSeats);
    const totalSeatCapacity = aeroplaneEconomyCapacity + aeroplaneBusinessCapacity + aeroplaneFirstclassCapacity;

        if (economySeats > aeroplaneEconomyCapacity) {
            console.log(`Too many economy seats booked (${economySeats} > ${aeroplaneEconomyCapacity})`)
            return false; //validation unsuccessful
        } else if (businessSeats > aeroplaneBusinessCapacity){
            console.log(`Too many business seats booked (${businessSeats} > ${aeroplaneBusinessCapacity})`)
            return false; //validation unsuccessful
        } else if (firstClassSeats > aeroplaneFirstclassCapacity){
            console.log(`Too many business seats booked (${firstClassSeats} > ${aeroplaneFirstclassCapacity})`)
            return false; //validation unsuccessful
        } else if (totalSeatsBooked > totalSeatCapacity){
            console.log(`Too many total seats booked (${totalSeatsBooked} > ${totalSeatCapacity})`)
            return false; //validation unsuccessful
        }
    
    return true; //validation successful

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
            // throw new Error(`Aircraft ${typeOfAircraft} doesn't have the range to fly to ${overseasAirport}`);
            console.log(`Aircraft ${typeOfAircraft} doesn't have the range to fly to ${overseasAirport}`);
            return false; //validation unsuccessful
        }
    
    return true; //validation successful
    
}   

// ----------------!Functions to help calculate income & cost !---------------

// FUNCTION -1 
function calculateFlightIncome(economySeats, priceEconomySeat, businessSeats, priceBusinessSeat, firstClassSeats, priceFirstClassSeat){
    // total income per flight from all 3 (economy + business + first class)
    return ((economySeats * priceEconomySeat) + 
        (businessSeats * priceBusinessSeat) + 
        (firstClassSeats * priceFirstClassSeat));
};


// FUNCTION -2 
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

// ----------------!Output to the screen the details of the flight and the expected profit or loss for each flight.---------------
function ProcessData(flight_data_csv){
    const flightsData = readCsv(flight_data_csv);
    // console.log(flightsData);

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
        // step 1: 
        let outputArray = [];
        let outputTxtArray = [];

        // step 2: map through each line of flights data 
        // & output to be an array of objects - added extra columns of income, cost, profit
        flightsOjects.forEach(flight => {
            // validation of each flight before carrying out the calc. if validation false -> no calculation
            if (!validateAirportCode(flight.ukAirport, flight.overseasAirport)) return;
            if (!validateAircraftCapacity(flight.noOfEconomySeatsBooked, flight.noOfBusinessSeatsBooked, flight.noOfFirstClassSeatsBooked, flight.typeOfAircraft)) return;
            if (!validateFlightRange(flight.ukAirport, flight.overseasAirport, flight.typeOfAircraft)) return; 
            
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
            console.log(`£${flightIncome} (income) - £${flightCost} (cost) = £${flightProfit} The flight from ${ukAirportName} (${flight.ukAirport}) to (${flight.overseasAirport}) (${overseasAirportName}) using a ${flight.typeOfAircraft}, with the given seat bookings and prices, would result in a profit of £${flightProfit}.`);
            console.log(' ')
            outputTxtArray.push((`£${flightIncome} (income) - £${flightCost} (cost) = £${flightProfit} The flight from ${ukAirportName} (${flight.ukAirport}) to (${flight.overseasAirport}) (${overseasAirportName}) using a ${flight.typeOfAircraft}, with the given seat bookings and prices, would result in a profit of £${flightProfit}.`));

            // add_push an array of objects to output array.
            outputArray.push({
                "flightFromCode": flight.ukAirport, 
                "flightFromName": ukAirportName, 
                "flightTo": flight.overseasAirport,
                "flightToName": overseasAirportName, 
                "aircraft": flight.typeOfAircraft,    
                "flightIncome" : flightIncome.toString(),
                "flightCost" : flightCost.toString(),
                "flightProfit" : flightProfit.toString()
            });
        });

        // create .txt file with the. ouputs.
        const stringForTxtFile = outputTxtArray.join("\n") + "\n"
        if (fs.existsSync("outdata.txt")) {fs.unlinkSync("outdata.txt")};
        fs.appendFileSync("outdata.txt", stringForTxtFile)
        
        // console.table(outputArray)
        console.log(outputArray)
        return outputArray;

        // pass outputArray as string to create new csv file 
        // const header = Object.keys(outputArray[0]);
        // const arrayForTxtFile = [header, ...outputArray.map(obj => Object.values(obj))];

    } catch (err) { //if an error occurs, code stops executing in the try block & immediately jumps to catch block.  catch block handles error allowing the program to continue smoothly without creaching!!
        console.error(`Error processing flight: ${err.message}`);
        return null;
    }
}

// own test 
// // --VALID FLIGHT DATA--
// const validData = 'valid_flight_data.csv';

// // ProcessData(validData)
// ProcessData(validData)

// --INVALID FLIGHT DATA--
const invalidData = 'invalid_flight_data.csv';

// // ProcessData(validData)
ProcessData(invalidData)

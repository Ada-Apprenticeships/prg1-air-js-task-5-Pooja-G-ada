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

// --VALID FLIGHT DATA--
const flightsData = readCsv('valid_flight_data.csv');

// --INVALID FLIGHT DATA--
// const flightsData = readCsv('invalid_flight_data.csv');

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
        PriceOfAFirstClassSeat : flight[8].match(/\d+/)[0]
    };
});

// VALIDATE AIRCRAFT CODE
function validateAirportCode(ukAirport, overseasAirport){
    const overseasAirportObj = airportOjects.find(airport => airport.code === overseasAirport);
    if ((ukAirport !== "MAN" && ukAirport !== "LGW") || !overseasAirportObj){
        throw new Error(`Invalid airport code: ${ukAirport} or ${overseasAirport}`);
    }
}

// VALIDATE AIRCRAFT CAPACITY
function validateAircraftCapacity(economySeats, businessSeats, firstClassSeats, typeOfAircraft){
    // check economy seats 
    const aeroplane = aeroplanesOjects.find(aeroplane => aeroplane.type === typeOfAircraft)
    const aeroplaneEconomyCapacity = aeroplane ? Number(aeroplane.economySeats) : 0;
    const aeroplaneBusinessCapacity = aeroplane ? Number(aeroplane.businessSeats) : 0;
    const aeroplaneFirstclassCapacity = aeroplane ? Number(aeroplane.firstclassSeats) : 0;

    const totalSeatsBooked = economySeats + businessSeats + firstClassSeats;
    const totalSeatCapacity = aeroplaneEconomyCapacity + aeroplaneBusinessCapacity + aeroplaneFirstclassCapacity;

    if (economySeats > aeroplaneEconomyCapacity) {
        console.log(`Too many economy seats booked (${economySeats} > ${aeroplaneEconomyCapacity})`)
    } else if (businessSeats > aeroplaneBusinessCapacity){
        console.log(`Too many business seats booked (${businessSeats} > ${aeroplaneBusinessCapacity})`)
    } else if (firstClassSeats > aeroplaneFirstclassCapacity){
        console.log(`Too many business seats booked (${firstClassSeats} > ${aeroplaneFirstclassCapacity})`)
    } else if (totalSeatsBooked > totalSeatCapacity){
        console.log(`Too many total seats booked (${totalSeatCapacity} > ${totalSeatCapacity})`)
    }
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
        throw new Error(`Aircraft ${typeOfAircraft} doesn't have the range to fly to ${overseasAirport}`);
    } 
}   


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
    
    // console.log(`Distance from ${ukAirport} to ${overseasAirport}: ${distanceBetweenAirportsKm} km`);
    
    //2. calculate total seats 
    const aeroplane = aeroplanesOjects.find(aeroplane => aeroplane.type === typeOfAircraft); //find the aeroplane based on flight type code
    
    //3. calculate cost per seat 
    //  get costPerSeatPer100km of the flight type
    const costPerSeatPer100km = aeroplane ? Number(aeroplane.runningCostPerSeatPer100km) : 0;   
    const costPerSeatPounds = ((distanceBetweenAirportsKm / 100) * costPerSeatPer100km).toFixed(2);

    console.log(`cost per seat for the entire flight : ${costPerSeatPounds}`)
    return costPerSeatPounds
}

// ----------------!output to the screen the details of the flight and the expected profit or loss for each flight.---------------
try {
    // step 1: 
    let outputArray = flightsOjects;
    // step 2: map through each line of flights data 
    // & output to be an array of objects - added extra columns of income, cost, profit
    flightsOjects.forEach(flight => {
        validateAirportCode(flight.ukAirport, flight.overseasAirport)
        validateAircraftCapacity(flight.noOfEconomySeatsBooked, flight.noOfBusinessSeatsBooked, flight.noOfFirstClassSeatsBooked, flight.typeOfAircraft)
        validateFlightRange(flight.ukAirport, flight.overseasAirport, flight.typeOfAircraft)
        
        
        // step 2a: function to calculate income
        let flightIncome = calculateFlightIncome(flight.noOfEconomySeatsBooked, flight.PriceOfAEconomyClassSeat,  
        flight.noOfBusinessSeatsBooked, flight.PriceOfABusinessClassSeat,  
        flight.noOfFirstClassSeatsBooked, flight.PriceOfAFirstClassSeat)
        
        //add income key-value to flight object
        flight["flightIncome"] = flightIncome.toString();
        
        // step 2b: function to calculate cost of flight
            // function to calculate cost per seat 
            // total seat * cost per seat.
        let totalSeatsTaken =  Number(flight.noOfEconomySeatsBooked) + Number(flight.noOfBusinessSeatsBooked) + Number(flight.noOfFirstClassSeatsBooked)
        let flightcost = (calculateFlightCostPerSeat(flight.ukAirport, flight.overseasAirport, flight.typeOfAircraft)
            * totalSeatsTaken).toFixed(2);

        //add cost key-value to flight object
        flight["flightcost"] = flightcost.toString()
        
        // step 2c: calculate profit
        let flightProfit = (flightIncome - flightcost).toFixed(2);
        flight["flightProfit"] = flightProfit.toString()
    });

    console.table(outputArray)
    console.log(outputArray)
    return outputArray;
    
} catch (err) { //if an error occurs, code stops executing in the try block & immediately jumps to catch block.  catch block handles error allowing the program to continue smoothly without creaching!!
    console.error(`Error processing flight: ${err.message}`);
    // console.error(flightsOjects);
    return null;
}

// PROCESS OUTPUT ARRAY TO TEXT FILE
function objectToArrayWithHeader(obj) {
    const header = Object.keys(obj);
    const rows = Object.values(obj);
    return [header, ...rows];
};

const txtArray = objectToArrayWithHeader(outputArray);
console.log(txtArray);
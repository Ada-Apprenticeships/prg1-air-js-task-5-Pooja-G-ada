const {
    readCsv,
    validateAirportCode,
    validateAircraftCapacity,
    validateFlightRange,
    calculateFlightCostPerSeat,
    calculateFlightIncome,
    ProcessData,
    CreateTxtFile,
} = require('./planning.js');

describe('Planning Tests', () => {
    // if the filepath exists function 
    describe("readCsv", () => {
        // if correct file path return array
        test("should return data array", () => {
          expect(readCsv("./test_flight_data.csv")).toStrictEqual(
            [[
                "MAN", 
                "JFK", 
                "Large narrow body", 
                "150", 
                "12", 
                "2", 
                "399", 
                "999", 
                "1899"
            ]]
          );
        });
    
        test("handles nonexistent and empty file paths", () => {
          expect(readCsv("./nonexistent.csv")).toBe(null);
          expect(readCsv("")).toBe(null);
        });
    });
    // ProcessData
    describe("Process Data", () => {
        test("should print output to user in console", () => {
            expect(ProcessData("./test_flight_data.csv")).toBe(
                // typeof outputTxtArray === Array
            );
            // expect(consoleOutput).toEqual("£75636 (income) - £61716.48 (cost) = £13919.52 The flight from Manchester (MAN) to (JFK) (John F Kennedy International) using a Large narrow body, with the given seat bookings and prices, would result in a profit of £13919.52.");
        })

        test("if any error", () => {
          expect(ProcessData("./nonexistent.csv")).toBe(null);
          expect(ProcessData("")).toBe(null);
        });
    })
});
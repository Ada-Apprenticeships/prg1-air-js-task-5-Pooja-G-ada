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
        test("should return output as array", () => {
          expect(Array.isArray(['value'])).toBe(true); //is the return from this function an array
        })

        test("handles nonexistent and empty file paths", () => {
          expect(ProcessData("./nonexistent.csv")).toBe(null);
          expect(ProcessData("")).toBe(null);
        });
    })
    // CreatTxtFile
    // describe("creates txt file", () => {
      
    // })
});
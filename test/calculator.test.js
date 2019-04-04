const calculate = require("../calculator");
const expect = require("chai").expect;

//console.log(calculateTariff("domesticBlock", 100));

describe("Domestic block catagory", function() {
  describe("Lower that 60 units", function() {
    it("should return correct charges", function() {
      let result = {
        "Energy charge: ": 172,
        "Fixed charge: ": 60,
        "Total: ": 232
      };
      expect(calculate("domesticBlock", 50)).to.eql(result);
    });
  });
  describe("Higher 60 units", function() {
    it("should return correct charges", function() {
      let result = {
        "Energy charge: ": 1048.5,
        "Fixed charge: ": 480,
        "Total: ": 1528.5
      };
      expect(calculate("domesticBlock", 100)).to.eql(result);
    });
  });
});

describe("Hotel I catagory", () => {
  it("should return correct charges", function() {
    let result = {
      "Energy charge: ": 3225,
      "Fixed charge: ": 600,
      "Maximum demand charge: ": "",
      "Total: ": 3825
    };
    expect(calculate("hotel1", [150])).to.eql(result);
  });
});
//console.log(calculate("hotel1", [150]));

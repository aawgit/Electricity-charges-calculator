/*This script was written to calculate end user electricty charges in Sri Lanka.
The rates are as per the approved tariffs as at 20/12/2018, referenced from 
http://www.pucsl.gov.lk/english/industries/electricity/electricity-tariffscharges/ 

The calculation assumes that billing period is 30 days. When it changes, the rates
need to be adjusted in a linear manner*/

/**
 * @param {string} userTariffCatagory - Tariff catagory.
 * @param {string | string[]} usage - Consumption in units (kWh).
 * @returns {string} - Cost in LKR for the consuption.
 */

/** Tariff catagories:
  *'domesticBlock',
  'domesticToU',
  'religious',
  'industrial1Block',
  'industrial1ToU',
  'industrial2',
  'industrial3',
  'hotel1',
  'hotel2',
  'hotel3',
  'general1',
  'general2',
  'general3',
  'government1',
  'government2',
  'government3',
  'dcFast',
  'level2AC' 

  Usage:
  Case - domesticBlock, religious, industrial1Block, hotel1, general1: Block type tariff: total kWh
  Case - domesticToU, industrial1ToU, industrial2, industrial3, hotel2, hotel3, general2, general3, 
        'dcFast','level2AC': ToU type tariff: [off peak kWh, day kWh, peak kWh, kVA]
  Case -'government1', 'government2', 'government3': Constant type tafiff: [total kWh, kVA]
  */

module.exports = calculate;

function calculate(userTariffCatagory, usage) {
  //invokes relevent calculate function according to the tariff category type
  function calculateTariff(userTariffCatagory, usage) {
    catagory = getCatagorySpecs(userTariffCatagory, usage);
    let result = "";

    switch (catagory.type) {
      case "block":
        result = calculateBlockTariff(usage, catagory);
        break;
      case "ToU":
        result = calculateToUTariff(usage, catagory);
        break;
      case "constant":
        result = calculateConstantRateTariff(usage, catagory);
        break;
    }
    return result;
  }

  //calculator for the block type tariffs
  function calculateBlockTariff(unCalculatedUsage, catagorySpecs) {
    let energyCharge = 0;
    let fixedCharge = 0;
    let total = 0;
    let largestBlock = true;

    for (let i = catagorySpecs.blocks.length - 1; i >= 0; i--) {
      if (unCalculatedUsage > catagorySpecs.blocks[i]) {
        usageInCurrentBlock = unCalculatedUsage - catagorySpecs.blocks[i];
        energyCharge += usageInCurrentBlock * catagorySpecs.blockRates[i];
        unCalculatedUsage -= usageInCurrentBlock;
        if (largestBlock) {
          fixedCharge = catagorySpecs.fixedChargeRates[i];
          largestBlock = false;
        }
      }
    }
    total = energyCharge + fixedCharge;
    let result = {
      "Energy charge: ": energyCharge,
      "Fixed charge: ": fixedCharge,
      "Total: ": total
    };
    return result;
  }

  //calculator for the ToU tariffs
  function calculateToUTariff(unCalculatedUsage, catagorySpecs) {
    let result = {
      "Off peak charge: ": "",
      "Day charge: ": "",
      "Peak charge: ": "",
      "Fixed charge: ": "",
      "Maximum demand charge: ": "",
      "Total: ": ""
    };
    //energyCharge += unCalculatedUsage[i] * catagorySpecs.ToURates[i];
    result["Off peak charge: "] =
      unCalculatedUsage[0] * catagorySpecs.ToURates[0];
    result["Day charge: "] = unCalculatedUsage[0] * catagorySpecs.ToURates[1];
    result["Peak charge: "] = unCalculatedUsage[0] * catagorySpecs.ToURates[2];
    result["Total: "] =
      result["Off peak charge: "] +
      result["Day charge: "] +
      result["Peak charge: "];

    if (catagorySpecs.fixedChargeRates) {
      result["Fixed charge: "] = catagorySpecs.fixedChargeRates;
      result["Total: "] += result["Fixed charge: "];
    }
    if (catagorySpecs.kVArate) {
      result["Maximum demand charge: "] =
        unCalculatedUsage[unCalculatedUsage.length - 1] * catagorySpecs.kVArate;
      result["Total: "] += result["Maximum demand charge: "];
    }
    return result;
  }

  //calculator for the constant rate tariffs
  function calculateConstantRateTariff(unCalculatedUsage, catagorySpecs) {
    let energyCharge = 0;
    let fixedCharge = 0;
    let maximumDemandCharge = 0;
    let result = {
      "Energy charge: ": energyCharge,
      "Fixed charge: ": fixedCharge,
      "Maximum demand charge: ": "",
      "Total: ": ""
    };
    result["Energy charge: "] =
      unCalculatedUsage[0] * catagorySpecs.constantRate;
    result["Fixed charge: "] = catagorySpecs.fixedChargeRates;
    result["Total: "] = result["Energy charge: "] + result["Fixed charge: "];
    if (catagorySpecs.kVArate) {
      maximumDemandCharge = unCalculatedUsage[1] * catagorySpecs.kVArate;
      result["Maximum demand charge: "] = maximumDemandCharge;
      result["Total: "] += result["Maximum demand charge: "];
    }
    return result;
  }

  //retrievs catagory specs from the tariffCatagoryList object according to user inputs
  function getCatagorySpecs(userTariffCatagory, usage) {
    catagorySpecs = tariffCatagoryList[userTariffCatagory];

    //if domestic, get the correct *sub-catagory depending on the usage
    if (userTariffCatagory === "domesticBlock") {
      if (usage > 60) {
        catagorySpecs = catagorySpecs.over60;
      } else {
        catagorySpecs = catagorySpecs.notOver60;
      }
    }
    return catagorySpecs;
  }
  //contains specs relating to each tariff catagory
  let tariffCatagoryList = {
    domesticBlock: {
      name: "Domestic",
      type: "block",
      over60: {
        blocks: [0, 60, 90, 120, 180],
        blockRates: [7.85, 10.0, 27.75, 32.0, 45.0],
        fixedChargeRates: [0, 90, 480, 480, 540],
        type: "block"
      },
      notOver60: {
        blocks: [0, 30],
        blockRates: [2.5, 4.85],
        fixedChargeRates: [30, 60],
        type: "block"
      }
    },
    domesticToU: {
      name: "Domestic (ToU)",
      ToURates: [13, 25, 54],
      fixedChargeRates: 540,
      type: "ToU"
    },
    religious: {
      name: "Religious",
      blocks: [0, 30, 90, 120, 180],
      blockRates: [1.9, 2.8, 6.75, 7.5, 9.4],
      fixedChargeRates: [30, 60, 180, 180, 240],
      type: "block"
    },
    industrial1Block: {
      name: "Industrial 1",
      blocks: [0, 300],
      blockRates: [10.8, 12.2],
      fixedChargeRates: [600, 600], // 600 for all blocks
      type: "block"
    },
    industrial1ToU: {
      name: "Industrial 1 (ToU)",
      ToURates: [6.85, 11.0, 20.5],
      fixedChargeRates: 300,
      type: "ToU"
    },
    industrial2: {
      name: "Industrial 2",
      ToURates: [6.85, 11, 20.5],
      fixedChargeRates: 3000,
      kVArate: 1100,
      type: "ToU"
    },
    industrial3: {
      name: "Industrial 3",
      ToURates: [5.9, 10.25, 23.5],
      fixedChargeRates: 3000,
      kVArate: 1000,
      type: "ToU"
    },
    hotel1: {
      name: "Hotel 1",
      constantRate: [21.5],
      fixedChargeRates: 600,
      type: "constant"
    },
    hotel2: {
      name: "Hotel 2",
      ToURates: [9.8, 14.65, 23.5],
      fixedChargeRates: 3000,
      kVArate: 1100,
      type: "ToU"
    },
    hotel3: {
      name: "Hotel 3",
      ToURates: [8.8, 13.7, 22.5],
      fixedChargeRates: 3000,
      kVArate: 1100,
      type: "ToU"
    },
    general1: {
      name: "General Purpose 1",
      blocks: [0, 300],
      blockRates: [18.3, 22.85],
      fixedChargeRates: [240, 240], //240 for all blocks
      type: "block"
    },
    general2: {
      name: "General Purpose 2",
      ToURates: [15.4, 21.8, 26.6],
      fixedChargeRates: 3000,
      type: "ToU"
    },
    general3: {
      name: "General Purpose 3",
      ToURates: [14.35, 20.7, 25.5],
      fixedChargeRates: 3000,
      kVArate: 1000,
      type: "ToU"
    },
    government1: {
      name: "Government 1",
      constantRate: [14.65],
      fixedChargeRates: 600,
      type: "constant"
    },
    government2: {
      name: "Government 2",
      constantRate: [14.55],
      fixedChargeRates: 3000,
      kVArate: 1100,
      type: "constant"
    },
    government3: {
      name: "Government 3",
      constantRate: [14.35],
      fixedChargeRates: 3000,
      kVArate: 1000,
      type: "constant"
    },
    dcFast: {
      name: "DC Fast Charging",
      ToURates: [30, 50, 70],
      type: "ToU"
    },
    level2AC: {
      name: "Level 2 AC charging",
      ToURates: [20, 30, 55],
      type: "ToU"
    }
  };
  return calculateTariff(userTariffCatagory, usage);
}

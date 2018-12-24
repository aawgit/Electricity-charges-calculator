/*This script was written to calculate end user electricty charges in Sri Lanka.
The rates are as per the approved tariffs as at 20/12/2018, referenced from 
http://www.pucsl.gov.lk/english/industries/electricity/electricity-tariffscharges/ */

document.getElementById('userDataForm').addEventListener('submit', calculate);


function calculate(e) {
    e.preventDefault();

    //get user inputs, implemented in support.js
    let userTariffCatagory = getTariffCatagory();
    let usage = getUsage();

    printResult(calculateTariff(userTariffCatagory, usage));

}

function calculateTariff(userTariffCatagory, usage) {
    catagory = getCatagorySpecsNew(userTariffCatagory, usage);
    let result = '';

    switch (catagory.type) {
        case 'block':
            result = calculateBlockTariff(usage, catagory);
            break;
        case 'ToU':
            result = calculateToUTariff(usage, catagory);
            break;
        case 'constant':
            result = calculateConstantRateTariff(usage, catagory);
            break;
    }
    console.log(result);
    return result;
}


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
        'Energy charge: ': energyCharge,
        'Fixed charge: ': fixedCharge,
        'Total: ': total
    };
    return result;
}


function calculateToUTariff(unCalculatedUsage, catagorySpecs) {
    let result = {
        'Off peak charge: ': '',
        'Day charge: ': '',
        'Peak charge: ': '',
        'Fixed charge: ': '',
        'Maximum demand charge: ': '',
        'Total: ': ''
    };
    //energyCharge += unCalculatedUsage[i] * catagorySpecs.ToURates[i];
    result["Off peak charge: "] = unCalculatedUsage[0] * catagorySpecs.ToURates[0];
    result["Day charge: "] = unCalculatedUsage[0] * catagorySpecs.ToURates[1];
    result["Peak charge: "] = unCalculatedUsage[0] * catagorySpecs.ToURates[2];
    result["Total: "] = result["Off peak charge: "] + result["Day charge: "] + result["Peak charge: "];

    if (catagorySpecs.fixedChargeRates) {
        result["Fixed charge: "] = catagorySpecs.fixedChargeRates;
        result["Total: "] += result["Fixed charge: "];
    }
    if (catagorySpecs.kVArate) {
        result["Maximum demand charge: "] = unCalculatedUsage[unCalculatedUsage.length - 1] * catagorySpecs.kVArate;
        result["Total: "] += result["Maximum demand charge: "];
    }
    return result;
}


function calculateConstantRateTariff(unCalculatedUsage, catagorySpecs) {
    let energyCharge = 0;
    let fixedCharge = 0;
    let maximumDemandCharge = 0;
    let result = {
        'Energy charge: ': energyCharge,
        'Fixed charge: ': fixedCharge,
        'Maximum demand charge: ': '',
        'Total: ': ''
    };
    result["Energy charge: "] = unCalculatedUsage[0] * catagorySpecs.constantRate;
    result["Fixed charge: "] = catagorySpecs.fixedChargeRates;
    result["Total: "] = result["Energy charge: "] + result["Fixed charge: "];
    if (catagorySpecs.kVArate) {
        maximumDemandCharge = unCalculatedUsage[1] * catagorySpecs.kVArate;
        result["Maximum demand charge: "] = maximumDemandCharge;
        result["Total: "] += result["Maximum demand charge: "];
    }
    return result;
}

function getCatagorySpecs(userTariffCatagory, usage) {
    let catagorySpecs = {
        name: userTariffCatagory,
        type: 0,
        blocks: 0,
        blockRates: 0,
        fixedChargeRates: 0,
        ToURates: 0,
        kVArate: 0

    }
    switch (userTariffCatagory) {
        case 'domesticBlock':
            if (usage > 60) {
                catagorySpecs.blocks = [0, 60, 90, 120, 180];
                catagorySpecs.blockRates = [7.85, 10.00, 27.75, 32.00, 45.00];
                catagorySpecs.fixedChargeRates = [0, 90, 480, 480, 540];
                catagorySpecs.type = 'block';
            } else {
                catagorySpecs.blocks = [0, 30];
                catagorySpecs.blockRates = [2.50, 4.85];
                catagorySpecs.fixedChargeRates = [30, 60];
                catagorySpecs.type = 'block';
            }
            break;
        case 'domesticToU':
            catagorySpecs.ToURates = [13, 25, 54];
            catagorySpecs.fixedChargeRates = 540;
            catagorySpecs.type = 'ToU';
            break;
        case 'religious':
            catagorySpecs.blocks = [0, 30, 90, 120, 180];
            catagorySpecs.blockRates = [1.90, 2.80, 6.75, 7.50, 9.40];
            catagorySpecs.fixedChargeRates = [30, 60, 180, 180, 240];
            catagorySpecs.type = 'block';
            break;
        case 'industrial1Block':
            catagorySpecs.blocks = [0, 300];
            catagorySpecs.blockRates = [10.80, 12.20];
            catagorySpecs.fixedChargeRates = [600, 600];// 600 for all blocks
            catagorySpecs.type = 'block';
            break;
        case 'industrial1ToU':
            catagorySpecs.ToURates = [6.85, 11.0, 20.50];
            catagorySpecs.fixedChargeRates = 300;
            catagorySpecs.type = 'ToU';
            break;
        case 'industrial2':
            catagorySpecs.ToURates = [6.85, 11, 20.50];
            catagorySpecs.fixedChargeRates = 3000;
            catagorySpecs.kVArate = 1100;
            catagorySpecs.type = 'ToU';
            break;
        case 'industrial3':
            catagorySpecs.ToURates = [5.90, 10.25, 23.50];
            catagorySpecs.fixedChargeRates = 3000;
            catagorySpecs.kVArate = 1000;
            catagorySpecs.type = 'ToU';
            break;
        case 'hotel1':
            catagorySpecs.constantRate = [21.50];
            catagorySpecs.fixedChargeRates = 600;
            catagorySpecs.type = 'ToU';
            break;
        case 'hotel2':
            catagorySpecs.ToURates = [9.80, 14.65, 23.50];
            catagorySpecs.fixedChargeRates = 3000;
            catagorySpecs.kVArate = 1100;
            catagorySpecs.type = 'ToU';
            break;
        case 'hotel3':
            catagorySpecs.ToURates = [8.80, 13.70, 22.50];
            catagorySpecs.fixedChargeRates = 3000;
            catagorySpecs.kVArate = 1100;
            catagorySpecs.type = 'ToU';
            break;
        case 'general1':
            catagorySpecs.blocks = [0, 300];
            catagorySpecs.blockRates = [18.30, 22.85];
            catagorySpecs.fixedChargeRates = [240, 240]; //240 for all blocks
            catagorySpecs.type = 'block';
            break;
        case 'general2':
            catagorySpecs.ToURates = [15.40, 21.80, 26.60];
            catagorySpecs.fixedChargeRates = 3000;
            catagorySpecs.kVArate = 1100;
            catagorySpecs.type = 'ToU';
            break;
        case 'general3':
            catagorySpecs.ToURates = [14.35, 20.70, 25.50];
            catagorySpecs.fixedChargeRates = 3000;
            catagorySpecs.kVArate = 1000;
            catagorySpecs.type = 'ToU';
            break;
        case 'government1':
            catagorySpecs.constantRate = [14.65];
            catagorySpecs.fixedChargeRates = 600;
            catagorySpecs.type = 'constant';
            break;
        case 'government2':
            catagorySpecs.constantRate = [14.55];
            catagorySpecs.fixedChargeRates = 3000;
            catagorySpecs.kVArate = 1100;
            catagorySpecs.type = 'constant';
            break;
        case 'government3':
            catagorySpecs.constantRate = [14.35];
            catagorySpecs.fixedChargeRates = 3000;
            catagorySpecs.kVArate = 1000;
            catagorySpecs.type = 'constant';
            break;
        case 'dcFast':
            catagorySpecs.blockRates = [30, 50, 70];
            catagorySpecs.type = 'ToU';
            break;
        case 'level2AC':
            catagorySpecs.blockRates = [20, 30, 55];
            catagorySpecs.type = 'ToU';
            break;
        default:

    }
    return catagorySpecs;
}


function getCatagorySpecsNew(userTariffCatagory, usage) {
    catagorySpecs = tariffCatagoryList[userTariffCatagory];
    if (userTariffCatagory === 'domesticBlock') {
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
        name: 'Domestic',
        type: 'block',
        over60: {
            blocks: [0, 60, 90, 120, 180],
            blockRates: [7.85, 10.00, 27.75, 32.00, 45.00],
            fixedChargeRates: [0, 90, 480, 480, 540],
            type: 'block',
        },
        notOver60: {
            blocks: [0, 30],
            blockRates: [2.50, 4.85],
            fixedChargeRates: [30, 60],
            type: 'block',
        },
    },
    domesticToU: {
        name: 'Domestic (ToU)',
        ToURates: [13, 25, 54],
        fixedChargeRates: 540,
        type: 'ToU'
    },
    religious: {
        name: 'Religious',
        blocks: [0, 30, 90, 120, 180],
        blockRates: [1.90, 2.80, 6.75, 7.50, 9.40],
        fixedChargeRates: [30, 60, 180, 180, 240],
        type: 'block'
    },
    industrial1Block: {
        name: 'Industrial 1',
        blocks: [0, 300],
        blockRates: [10.80, 12.20],
        fixedChargeRates: [600, 600],// 600 for all blocks
        type: 'block'
    },
    industrial1ToU: {
        name: 'Industrial 1 (ToU)',
        ToURates: [6.85, 11.0, 20.50],
        fixedChargeRates: 300,
        type: 'ToU'
    },
    industrial2: {
        name: 'Industrial 2',
        ToURates: [6.85, 11, 20.50],
        fixedChargeRates: 3000,
        kVArate: 1100,
        type: 'ToU',
    },
    industrial3: {
        name: 'Industrial 3',
        ToURates: [5.90, 10.25, 23.50],
        fixedChargeRates: 3000,
        kVArate: 1000,
        type: 'ToU'
    },
    hotel1: {
        name: 'Hotel 1',
        constantRate: [21.50],
        fixedChargeRates: 600,
        type: 'constant'
    },
    hotel2: {
        name: 'Hotel 2',
        ToURates: [9.80, 14.65, 23.50],
        fixedChargeRates: 3000,
        kVArate: 1100,
        type: 'ToU'
    },
    hotel3: {
        name: 'Hotel 3',
        ToURates: [8.80, 13.70, 22.50],
        fixedChargeRates: 3000,
        kVArate: 1100,
        type: 'ToU'
    },
    general1: {
        name: 'General Purpose 1',
        blocks: [0, 300],
        blockRates: [18.30, 22.85],
        fixedChargeRates: [240, 240], //240 for all blocks
        type: 'block',
    },
    general2: {
        name: 'General Purpose 2',
        ToURates: [15.40, 21.80, 26.60],
        fixedChargeRates: 3000,
        type: 'ToU',
    },
    general3: {
        name: 'General Purpose 3',
        ToURates: [14.35, 20.70, 25.50],
        fixedChargeRates: 3000,
        kVArate: 1000,
        type: 'ToU',
    },
    government1: {
        name: 'Government 1',
        constantRate: [14.65],
        fixedChargeRates: 600,
        type: 'constant'
    },
    government2: {
        name: 'Government 2',
        constantRate: [14.55],
        fixedChargeRates: 3000,
        kVArate: 1100,
        type: 'constant'
    },
    government3: {
        name: 'Government 3',
        constantRate: [14.35],
        fixedChargeRates: 3000,
        kVArate: 1000,
        type: 'constant'
    },
    dcFast: {
        name: 'DC Fast Charging',
        ToURates: [30, 50, 70],
        type: 'ToU'
    },
    level2AC: {
        name: 'Level 2 AC charging',
        ToURates: [20, 30, 55],
        type: 'ToU',
    }

}


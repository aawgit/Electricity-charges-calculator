/*This script was written to calculate end user electricty charges in Sri Lanka.
The rates are as per the approved tariffs as at 20/12/2018, referenced from 
http://www.pucsl.gov.lk/english/industries/electricity/electricity-tariffscharges/ */

document.getElementById('userDataForm').addEventListener('submit', calculate);

function calculate(e) {
    e.preventDefault();

    //get user inputs, implemented in support.js
    let userTariffCatagory = getTariffCatagory();
    let usage = getUsage();

    //get catagory specs - tariff blocks, rates, type
    catagory = getCatagorySpecsNew(userTariffCatagory, usage);

    switch (catagory.type) {
        case 'block':
            charges = calculateBlockTariff(usage, catagory);
            total = charges[0] + charges[1];
            document.getElementById('result').innerHTML = '<p>Energy charge: ' + charges[0] + ' LKR' +
                '<br>Fixed charge: ' + charges[1] + ' LKR' +
                '<br>Total: ' + total + ' LKR';
            break;
        case 'ToU':
            charges = calculateToUTariff(usage, catagory);
            total = charges[0] + charges[1] + charges[2];
            document.getElementById('result').innerHTML = '<p>Energy charge: ' + charges[0] + ' LKR' +
                '<br>Fixed charge: ' + charges[1] + ' LKR' +
                '<br>Maximum demand charge: ' + charges[2] + ' LKR' +
                '<br>Total: ' + total + ' LKR';
            break;
        case 'constant':
            charges = calculateConstantRateTariff(usage, catagory);
            total = charges[0] + charges[1] + charges[2];
            document.getElementById('result').innerHTML = '<p>Energy charge: ' + charges[0] + ' LKR' +
                '<br>Fixed charge: ' + charges[1] + ' LKR' +
                '<br>Maximum demand charge: ' + charges[2] + ' LKR' +
                '<br>Total: ' + total + ' LKR';
            break;
    }
}


function calculateBlockTariff(unCalculatedUsage, catagorySpecs) {

    let energyCharge = 0;
    let fixedCharge = 0;
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
    return [energyCharge, fixedCharge];
}


function calculateToUTariff(unCalculatedUsage, catagorySpecs) {
    console.log(unCalculatedUsage, catagorySpecs);
    let energyCharge = 0;
    let fixedCharge = 0;
    let maximumDemandCharge = 0;
    for (let i = 0; i < unCalculatedUsage.length - 1; i++) {
        energyCharge += unCalculatedUsage[i] * catagorySpecs.ToURates[i];
    }
    if (catagorySpecs.fixedChargeRates) {
        fixedCharge = catagorySpecs.fixedChargeRates;
    }
    if (catagorySpecs.kVArate) {
        maximumDemandCharge = unCalculatedUsage[unCalculatedUsage.length - 1] * catagorySpecs.kVArate;
    }
    return [energyCharge, fixedCharge, maximumDemandCharge];
}


function calculateConstantRateTariff(unCalculatedUsage, catagorySpecs) {
    let energyCharge = 0;
    let fixedCharge = 0;
    let maximumDemandCharge = 0;

    energyCharge = unCalculatedUsage[0] * catagorySpecs.constantRate;
    fixedCharge = catagorySpecs.fixedChargeRates;
    if (catagorySpecs.kVArate) {
        maximumDemandCharge = unCalculatedUsage[1] * catagorySpecs.kVArate;
    }
    return [energyCharge, fixedCharge, maximumDemandCharge];
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


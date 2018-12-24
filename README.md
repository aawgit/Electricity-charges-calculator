# Electricity-charges-calculator
This repository contains the scripts and UI for calculating end user electricity charges applicable to customers served by utilities in Sri Lanka. The tariff is referenced from the Electricity Tariffs and Charges approved and published by the [Public Utilites Commission of Sri Lanka ](http://www.pucsl.gov.lk/english/industries/electricity/electricity-tariffscharges/).
Applicable bill amount can be calculated using `calculateTariff()`.

## calculateTariff()
Syntax: `calculateTariff(userTariffCatagory, usage)`
parameters: 

 1. userTariffCatagory: id of the tariff catagory, listed in `tariffCatagoryList` as keys
 2. usage: number, or an array, depending on the tariff category. Value of the array is as follows: `[offPeakUsage, dayUsage, peakUsage, maxmimumDemand]`

Returns: An object containing applicable charges in JSON format
Examples: 
Input:

    calculateTariff('industrial2', [90, 200, 120, 45]);
Output:

    {"Fixed charge: ": 3000, "Maximum demand charge:  ":  49500, "Day charge:  ":  990, "Off peak charge:  ":  616.5,  "Peak charge:  ":  1845,"Total:  ":  55951.5}

Input
   

     calculateTariff('religious', 110);
 

Output

    {"Energy charge: ": 360, "Fixed charge: ": 180, "Total: ": 540}
 

   Input
    
    calculateTariff('dcFast', [170, 60, 30]);
   Output

       {"Off peak charge: ": 5100, "Day charge: ": 8500, "Peak charge: ": 11900, "Fixed charge: ": "", "Maximum demand charge: ": "", "Total:  ": 25500}

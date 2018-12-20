//create the list of tariff catagory names to select from
let catagoryMenu = document.getElementById('inputGroupSelect01');
catagoryMenu.innerHTML = createCatagoryOptions();
catagoryMenu.addEventListener('change', recordCatagoryInput);


function createCatagoryOptions() {
    let optionsList = '';
    for (let catagory in tariffCatagoryList) {
        optionsList += '<option value="' + catagory + '">' + tariffCatagoryList[catagory].name + '</option>';
    }
    //let catagoryOptions = document.getElementById('inputGroupSelect01');
    //catagoryOptions.innerHTML = optionsList;
    return optionsList;
}


let userInputs = {
    catagory: 'DomesticBlock', //defaults
    type: 'block',
    usage: '',
}


function recordCatagoryInput(e) {
    tariffType = tariffCatagoryList[catagoryMenu.value].type;
    modifyUsageInputArea(tariffType);
    userInputs.type = tariffType;
}


function modifyUsageInputArea(type) {
    switch (type) {
        case 'ToU':
            let ToUInputArea = '<div class="input-group-prepend">' +
                '<span class="input-group-text" id="basic-addon3">Off peak</span>' +
                '</div><input type = "text" class="form-control" id = "offPeak" aria - describedby="basic-addon3" placeholder = "Number of units per month">' +
                '<br><div class="input-group-prepend">' +
                '<span class="input-group-text" id="basic-addon3">Day</span>' +
                '</div><input type = "text" class="form-control" id = "day" aria - describedby="basic-addon3" placeholder = "Number of units per month">' +
                '<br><div class="input-group-prepend">' +
                '<span class="input-group-text" id="basic-addon3">Peak</span>' +
                '</div><input type = "text" class="form-control" id = "peak" aria - describedby="basic-addon3" placeholder = "Number of units per month">';
            if (tariffCatagoryList[catagoryMenu.value].hasOwnProperty('kVArate')) {
                ToUInputArea += '<br><div class="input-group-prepend">' +
                    '<span class="input-group-text" id="basic-addon3">Max. demand</span>' +
                    '</div><input type = "text" class="form-control" id = "kVA" aria - describedby="basic-addon3" placeholder = "Maximum kVA reading">';
            }
            document.getElementById('input-group-consumption').innerHTML = ToUInputArea;
            break;
        case 'block':
            let blockInputArea = '<div class="input-group mb-3" id="input-group-consumption">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text" id="basic-addon3">Usage</span>' +
                '</div>' +
                '<input type="text" class="form-control" id="usage" aria-describedby="basic-addon3" placeholder="Number of units per month">' +
                '</div>';
            document.getElementById('input-group-consumption').innerHTML = blockInputArea;
            break;
        case 'constant':
            let constantInputArea = '<div class="input-group-prepend">' +
                '<span class="input-group-text" id="basic-addon3">Usage</span>' +
                '</div><input type = "text" class="form-control" id = "usage" aria - describedby="basic-addon3" placeholder = "Number of units per month">'
            if (tariffCatagoryList[catagoryMenu.value].hasOwnProperty('kVArate')) {
                constantInputArea += '<br><div class="input-group-prepend">' +
                    '<span class="input-group-text" id="basic-addon3">Max. demand</span>' +
                    '</div><input type = "text" class="form-control" id = "kVA" aria - describedby="basic-addon3" placeholder = "Maximum kVA reading">'
            }
            document.getElementById('input-group-consumption').innerHTML = constantInputArea;
            break;
        default:
        // code block
    }
}


function getTariffCatagory() {
    if (catagoryMenu.value) {
        userInputs.catagory = catagoryMenu.value;
    }
    return userInputs.catagory;
}


function getUsage() {
    switch (userInputs.type) {
        case 'ToU'://returns off peak, day, peak and kVA if applicable
            let ToUUsage = [document.getElementById('offPeak').value, document.getElementById('day').value, document.getElementById('peak').value];
            if (document.getElementById('kVA')) {
                ToUUsage.push(document.getElementById('kVA').value);
            }
            return ToUUsage;

        case 'block': //returns total monthly usage
            return document.getElementById('usage').value;

        case 'constant': //returns total monthly usage and kVA if applicable
            let ConstantUsage = [document.getElementById('usage').value];
            if (document.getElementById('kVA')) {
                ConstantUsage.push(document.getElementById('kVA').value);
            }
            return ConstantUsage;
    }
}




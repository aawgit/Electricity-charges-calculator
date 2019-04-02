//handles DOM manipulations and user inputs

let io = (function() {
  //event listener for the submit button
  document.getElementById("userDataForm").addEventListener("submit", calculate);

  //create the list of tariff catagory names to select from the tariffCatagoryList object
  let tariffCatagoryList = calculator.tariffCatagoryList;
  let catagoryMenu = document.getElementById("inputGroupSelect01");
  catagoryMenu.innerHTML = createCatagoryOptions(tariffCatagoryList);
  catagoryMenu.addEventListener("change", recordCatagoryInput);

  function calculate(e) {
    e.preventDefault();

    //get user inputs,
    let userTariffCatagory = getTariffCatagory();
    let usage = getUsage();

    io.printResult(calculator.calculateTariff(userTariffCatagory, usage));
  }

  function createCatagoryOptions(tariffCatagoryList) {
    let optionsList = "";
    for (let catagory in tariffCatagoryList) {
      optionsList +=
        '<option value="' +
        catagory +
        '">' +
        tariffCatagoryList[catagory].name +
        "</option>";
    }
    return optionsList;
  }

  let userInputs = {
    catagory: "DomesticBlock", //defaults
    type: "block",
    usage: ""
  };

  function recordCatagoryInput(e) {
    tariffType = tariffCatagoryList[catagoryMenu.value].type;
    modifyUsageInputArea(tariffType);
    userInputs.type = tariffType;
    clearResults();
  }

  function modifyUsageInputArea(type) {
    switch (type) {
      case "ToU":
        let ToUInputArea =
          '<label for="offPeak" class="col-sm-2 col-form-label">Off peak:</label>' +
          '<div class="col-sm-10">' +
          '<input type="text" class="form-control" id="offPeak" aria-describedby="basic-addon3" placeholder="Off peak consumption">' +
          "</div>" +
          '<label for="day" class="col-sm-2 col-form-label">Day:</label>' +
          '<div class="col-sm-10">' +
          '<input type="text" class="form-control" id="day" aria-describedby="basic-addon3" placeholder="Day consumption">' +
          "</div>" +
          '<label for="peak" class="col-sm-2 col-form-label">Peak:</label>' +
          '<div class="col-sm-10">' +
          '<input type="text" class="form-control" id="peak" aria-describedby="basic-addon3" placeholder="Peak consumption">' +
          "</div>";

        if (tariffCatagoryList[catagoryMenu.value].hasOwnProperty("kVArate")) {
          ToUInputArea +=
            '<label for="peak" class="col-sm-2 col-form-label">Max. demand:</label>' +
            '<div class="col-sm-10">' +
            '<input type="text" class="form-control" id="kVA" aria-describedby="basic-addon3" placeholder="Maximum kVA">' +
            "</div>";
        }
        document.getElementById(
          "input-group-consumption"
        ).innerHTML = ToUInputArea;
        break;
      case "block":
        let blockInputArea =
          '<label for="peak" class="col-sm-2 col-form-label">Usage:</label>' +
          '<div class="col-sm-10">' +
          '<input type="text" class="form-control" id="usage" aria-describedby="basic-addon3" placeholder="Number of units per month">' +
          "</div>";
        document.getElementById(
          "input-group-consumption"
        ).innerHTML = blockInputArea;
        break;
      case "constant":
        let constantInputArea =
          '<label for="peak" class="col-sm-2 col-form-label">Usage:</label>' +
          '<div class="col-sm-10">' +
          '<input type="text" class="form-control" id="usage" aria-describedby="basic-addon3" placeholder="Number of units per month">' +
          "</div>";
        if (tariffCatagoryList[catagoryMenu.value].hasOwnProperty("kVArate")) {
          constantInputArea +=
            '<label for="peak" class="col-sm-2 col-form-label">Max. demand:</label>' +
            '<div class="col-sm-10">' +
            '<input type="text" class="form-control" id="kVA" aria-describedby="basic-addon3" placeholder="Maximum kVA">' +
            "</div>";
        }
        document.getElementById(
          "input-group-consumption"
        ).innerHTML = constantInputArea;
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
      case "ToU": //returns off peak, day, peak and kVA if applicable
        let ToUUsage = [
          document.getElementById("offPeak").value,
          document.getElementById("day").value,
          document.getElementById("peak").value
        ];
        if (document.getElementById("kVA")) {
          ToUUsage.push(document.getElementById("kVA").value);
        }
        return ToUUsage;

      case "block": //returns total monthly usage
        return document.getElementById("usage").value;

      case "constant": //returns total monthly usage and kVA if applicable
        let ConstantUsage = [document.getElementById("usage").value];
        if (document.getElementById("kVA")) {
          ConstantUsage.push(document.getElementById("kVA").value);
        }
        return ConstantUsage;
    }
  }

  function printResult(result) {
    let outputArea = "";
    for (let property in result) {
      if (result[property]) {
        if (property === "Total: ") {
          outputArea +=
            '<li class="list-group-item d-flex justify-content-between lh-condensed">' +
            "<span> Total: </span>" +
            "<strong>" +
            formatNumber(result[property]) +
            " LKR </strong>" +
            "</li>";
        } else {
          outputArea +=
            '<li class="list-group-item d-flex justify-content-between lh-condensed">' +
            "<div>" +
            "<span>" +
            property +
            "</span>" +
            "</div>" +
            '<span class="text-muted">' +
            formatNumber(result[property]) +
            " LKR </span>" +
            "</li>";
        }
      }
    }
    document.getElementById("charges-list").innerHTML = outputArea;
  }

  function formatNumber(number) {
    return accounting.formatMoney(number, { symbol: "", format: "%v %s" });
    //return Math.round(number*100)/100;
  }

  function clearResults() {
    document.getElementById("charges-list").innerHTML = "";
  }
  return {
    getTariffCatagory: getTariffCatagory,
    getUsage: getUsage,
    printResult: printResult,
    formatNumber: formatNumber,
    clearResults: clearResults,
    calculate: calculate
  };
})();

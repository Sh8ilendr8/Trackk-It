function Calculate(){
    var height = document.getElementById("h-input").value;
    var weight = document.getElementById("w-input").value;

    var result = parseFloat(weight) /(parseFloat(height)*parseFloat(height)/10000);

    if(!isNaN(result)){
        document.getElementById("bmi-output").innerHTML = result;
        if(result < 18.5){
            document.getElementById("bmi-status").innerHTML = "Underweight";
        }
        else if(result < 25){
            document.getElementById("bmi-status").innerHTML = "Healthy";
        }
        else if(result < 30){
            document.getElementById("bmi-status").innerHTML = "Overweight";
        }
        else{
            document.getElementById("bmi-status").innerHTML = "Obesity";
        }
    }
}

var inputHeightBox = document.getElementById("h-input");
var invalidChars = [
  "-",
  "+",
  "e",
];
inputHeightBox.addEventListener("keydown", function(e) {
  if (invalidChars.includes(e.key)) {
    e.preventDefault();
  }
});

var inputWidthBox = document.getElementById("w-input");
var invalidChars = [
  "-",
  "+",
  "e",
];
inputWidthBox.addEventListener("keydown", function(e) {
  if (invalidChars.includes(e.key)) {
    e.preventDefault();
  }
});

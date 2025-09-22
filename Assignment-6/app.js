let studentTable = document.getElementById("student-table");
let addStudent = document.getElementById("add-student");
let sNo = 1;

addStudent.addEventListener("click", function () {
  let namePrompt = prompt("Enter Student Name");
  let row = document.createElement("tr");
  row.innerHTML = `
            <td>${sNo++}</td>
            <td>${namePrompt}</td>
            <td><input type="number" class="maths-marks"></td>
            <td><input type="number" class="science-marks"></td>
            <td><input type="number" class="english-marks"></td>
    <td class="total-marks"></td>
    <td class="percentage"></td>
    <td class="grade"></td>
    <td><button class="check-btn">Check</button></td>
    `;
  studentTable.appendChild(row);

  // button 
  let checkBtn = row.querySelector(".check-btn");
  checkBtn.addEventListener("click", function () {
    let maths = row.querySelector(".maths-marks").value || 0;
    let science = row.querySelector(".science-marks").value || 0;
    let english = row.querySelector(".english-marks").value || 0;

    let total = +maths + +science + +english;
    row.querySelector(".total-marks").innerText = total;

    let perc = (total / 300) * 100;
    row.querySelector(".percentage").innerText = `${perc.toFixed(2)}%`;

    let grade = "F";
    if (perc >= 80) grade = "A";
    else if (perc >= 60) grade = "B";
    else if (perc >= 40) grade = "C";
    row.querySelector(".grade").innerText = grade;
  });
});

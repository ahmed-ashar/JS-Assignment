document.addEventListener("DOMContentLoaded", () => {
    const bars = document.querySelector(".bars");
    const resNavbar = document.querySelector(".res-navbar");

    if (bars) {
        bars.addEventListener("click", () => {
            resNavbar.style.display =
                resNavbar.style.display === "block" ? "none" : "block";
        });
    }


    const day = document.getElementById("day");
    const month = document.getElementById("month");
    const year = document.getElementById("year");
    
    let months = ["Jan" , "Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    let years = ["1990","1991","1992","1993","1994","1995","1996","1997","1998","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"]
   

    // for months :---
    for (let i = 0; i < months.length; i++) {
        let option = document.createElement("option"); 
        option.value = months[i]; 
        option.text = months[i];  
        month.appendChild(option); 
    }

    // for days :---
    for (let i = 1; i <= 31; i++) {
        let option = document.createElement("option");
        option.value = i; 
        option.text = i;  
        day.appendChild(option);
    }


    // for years :--
    for(let i =0 ; i < years.length;i++){
        let option = document.createElement("option")
        option.value = years[i]
        option.text = years[i]
        year.appendChild(option)
    }

    const form = document.querySelector("form");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();


            const dob = `${day.value}-${month.value}-${year.value}`; 

            const formData = {
                firstName: document.getElementById("first-name").value,
                surname: document.getElementById("surname").value,
                dob: dob, 
                gender: document.querySelector('input[name="gender"]:checked')?.value || "",
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            };

            console.log(formData);
        });
    }
});

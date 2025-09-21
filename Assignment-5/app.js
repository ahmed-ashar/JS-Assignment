document.addEventListener("DOMContentLoaded", () => {
    const bars = document.querySelector(".bars");
    const resNavbar = document.querySelector(".res-navbar");

    if (bars) {
        bars.addEventListener("click", () => {
            resNavbar.style.display =
                resNavbar.style.display === "block" ? "none" : "block";
        });
    }



    let months = [""]

    const form = document.querySelector("form");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const day = document.getElementById("day").value;
            const month = document.getElementById("month").value;
            const year = document.getElementById("year").value;

            const dob = `${day}-${month}-${year}`; 

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

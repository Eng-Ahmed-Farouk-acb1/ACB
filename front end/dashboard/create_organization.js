const API_URL = "https://acb-production-52f0.up.railway.app/";

document.addEventListener("DOMContentLoaded",async function(){
    let token = localStorage.getItem("token");
    if (token == null){
        window.location.href = "../login/login.html";
        return;
    }
    document.getElementById("submit-btn").addEventListener("click", async function (event){
        event.preventDefault();
        document.getElementById("submit-btn").disabled = true;
        let name = document.getElementById("name").value;
        let description = document.getElementById("description").value;
        try {
            let response = await fetch(API_URL + "new_organization/",{
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    owner_id: localStorage.getItem("user_id")
                }),

            })
            let data = await response.json();

            if (response.status == 200){
                message_area = document.getElementById("message-area");
                message_area.innerHTML = data.message;
                message_area.className = "message-area success";
                setTimeout(() => {
                    window.location.href = "../dashboard/dashboard.html";
                }, 2000);
            }
            else{
                message_area = document.getElementById("message-area");
                message_area.innerHTML = data.detail;
                message_area.className = "message-area error";
                document.getElementById("submit-btn").disabled = false;
            }
        }
        catch (error){
            message_area = document.getElementById("message-area");
            message_area.innerHTML = "An error occurred while creating the organization";
            message_area.className = "message-area error";
            document.getElementById("submit-btn").disabled = false;
        }
    })
})

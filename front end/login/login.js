const API_URL = "https://acb-production-52f0.up.railway.app/";
msg_area = document.getElementById("message-area");

async function login(){
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let response = await fetch(API_URL + "login/",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    let data = await response.json();
    if(response.status == 200){
        if (data.logged_in){ 
            write_msg("You have logged in, You will be redirected in 5 seconds", "success");
            setTimeout(function(){
                localStorage.setItem("token", data.token);
                localStorage.setItem("user_id", data.user_id);
                window.location.href = "../dashboard/dashboard.html";
            }, 5000);

        }
        else{
            write_msg(data.error)
        }
    }
    else{
        write_msg(data.detail);
    }
}

function write_msg(msg, type="error"){
    msg_area.innerHTML = msg;
    msg_area.className = "message-area " + type;
}

document.getElementById("submit-btn").addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();
    login();
});

document.getElementById("login-form").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        login();
    }
});

const API_URL = "https://acb-production-52f0.up.railway.app/";
const msg_area = document.getElementById("message-area");

async function register(){
    let username = document.getElementById("username").value;
    let display_name = document.getElementById("display-name").value;
    let password = document.getElementById("password").value;
    let repassword = document.getElementById("repassword").value;
    let email = document.getElementById("email").value;

    if (username.length < 5){
        write_msg("Username must be at least 5 characters");
        return;
    }
    if (password != repassword){
        write_msg("Passwords do not match");
        return;
    }
    if (password.length < 8){
        write_msg("Password must be at least 8 characters");
        return;
    }

    let response = await fetch(API_URL + "register/",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            display_name: display_name,
            password: password,
            email: email
        })
    })
    let data = await response.json();
    if(response.status == 200){
        write_msg("You have registered, You will be redirected in 5 seconds", "success");
        setTimeout(function(){
            localStorage.setItem("token", data.token);
            localStorage.setItem("user_id", data.user_id);
            window.location.href = "../dashboard/dashboard.html";
        }, 2000);
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
    register();
    return false;
});

document.getElementById("login-form").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        register();
        return false;
    }
});

document.getElementById("login-form").addEventListener("submit", function(event) {
    console.log("Form submit prevented");
    event.preventDefault();
    event.stopPropagation();
    register(event);
    return false;
});

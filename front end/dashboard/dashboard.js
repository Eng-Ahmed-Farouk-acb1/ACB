const API_URL = "https://acb-production-52f0.up.railway.app/";

function logout() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('display_name');
    localStorage.removeItem('user_id');
    
    // Redirect to login page
    window.location.href = "../login/login.html";
}
async function load_organizations(){
    let token = localStorage.getItem("token");
    let organizations = document.getElementById("organizations");
    organizations.innerHTML = '<div class="loading">Loading your organizations...</div>';
    let user_id = localStorage.getItem("user_id");
    try {
        let response = await fetch(API_URL + "users/" + user_id + "/organizations/",{
            method: "GET",
            headers: {
                "Authorization": "Token " + token
            }
        })
        let data = await response.json();
        console.log(data);
        if(response.status == 200){
            organizations.innerHTML = "";
            if (data.length == 0){
                organizations.innerHTML = '<div class="no-organizations">You are not part of any organization yet.</div>';
            }
            for (let org of data){
                let org_div = document.createElement("div");
                org_div.className = "organization";
                org_div.innerHTML = `
                    <h3>${org.name}</h3>
                    <p>${org.description}</p>
                    <a href="../organization/organization.html?org_id=${org.id}" class="view-btn">View Organization</a>
                    `
                organizations.appendChild(org_div);
            }
            add_organization_div = document.createElement("div");
            add_organization_div.className = "organization create-organization";
            add_organization_div.innerHTML = `
                <h3>Create new organization</h3>
                <p>Click the button below to create a new organization.</p>
                <a href="create_organization.html" class="view-btn">Create Organization</a>
            `
            organizations.appendChild(add_organization_div);
        }
        else{
            organizations.innerHTML = '<div class="error">Failed to load organizations. Please try again later.</div>';
        }
    }
    catch (error) {
        organizations.innerHTML = '<div class="error">An error occurred while loading organizations. Please try again later.</div>';
    }
    
}

document.addEventListener("DOMContentLoaded",async function(){
    let token = localStorage.getItem("token");
    if (token == null){
        window.location.href = "../login/login.html";
        return;
    }
    let user_id = localStorage.getItem("user_id");
    try {
        let response = await fetch(API_URL + "users/" + user_id + "/",{
            method: "GET",
            headers: {
                "Authorization": "Token " + token
            }
        })
        let data = await response.json();
        if(response.status == 200){
            document.getElementById("display-name").innerHTML = data.display_name;
            await load_organizations();
        }
        else{
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            window.location.href = "../login/login.html";
        }
    }
    catch (error){
        let organizations = document.getElementById("organizations");
        organizations.innerHTML = '<div class="error">An error occurred while loading your account. Please try again later.</div>';
    }
})

document.getElementById("logout-btn").addEventListener("click", logout);

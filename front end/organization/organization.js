const API_URL = "https://acb-production-52f0.up.railway.app/";

async function load_organization(){
    let token = localStorage.getItem("token");
    let urlParams = new URLSearchParams(window.location.search);
    let org_id = urlParams.get("org_id");
    let response = await fetch(API_URL + "organizations/" + org_id + "/",{
        method: "GET",
        headers: {
            "Authorization": "Token " + token
        }
    })
    let data = await response.json();
    if (response.status == 200){
        org_name = data.name;
        document.getElementById("organization-name").innerHTML = org_name;
        document.getElementById("balance").innerHTML = "Balance: " + data.balance + " $";
        load_members(org_id);
        load_transactions(org_id,org_name);
    }
    else{
        document.getElementById("org-name").innerHTML = "Failed to load organization details.";
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('display_name');
    localStorage.removeItem('user_id');
    
    window.location.href = "../login/login.html";
}


async function load_transactions(org_id,org_name){
    let response = await fetch(API_URL + "organization/" + org_id + "/transactions/",{
        method: "GET",
        headers: {
            "Authorization": "Token " + localStorage.getItem("token")
        }
    })
    let data = await response.json();
    if (response.status == 200){
        let transactions_div = document.getElementById("recent-transactions");
        transactions_div.innerHTML = "";
        if (data.length == 0){
            transactions_div.innerHTML = `<div class="no-transactions"><p>No transactions found for this organization</p></div>`;
            return;
        }
        for (let transaction of data.toReversed()){
            let transaction_div = document.createElement("div");
            if (transaction.receiver_bank_account_id == org_name){
                transaction_div.className = "transaction incoming";
            }
            else {
                transaction_div.className = "transaction";
            }
            transaction_div.innerHTML = `
                <h3>${transaction.amount} $</h3>
                <p class="title">${transaction.title}</p>
                <p class="detail">From: ${transaction.sender_bank_account_id} To: ${transaction.receiver_bank_account_id}</p>
                <p class="date">${new Date(transaction.timestamp).toLocaleString()}</p>
                `
            transactions_div.appendChild(transaction_div);
        }}}
document.getElementById("donate-btn").addEventListener("click", function() {
    document.getElementById("add-transaction-modal").classList.add("show");
});
async function load_members(org_id){
    let response = await fetch(API_URL + "organization/" + org_id + "/members/",{
        method: "GET",
        headers: {
            Authorization: "Token " + localStorage.getItem("token")
        }
    })
    let data = await response.json();
    console.log(data)
    if (response.status == 200){
        let members_div = document.getElementById("members");
        members_div.innerHTML = "";
        let members_list = document.createElement("ul");
        members_list.className = "members-list";
        for (let member of data.members){
            let member_li = document.createElement("li");
            member_li.className = "member";
            member_li.innerHTML = member;
            members_list.appendChild(member_li);
        }
        members_div.appendChild(members_list);
    }
}
async function new_transaction(){
    const amount = parseFloat(document.getElementById("transaction-amount").value);
    const description = document.getElementById("transaction-description").value;
    let urlParams = new URLSearchParams(window.location.search);
    let org_id = urlParams.get("org_id");
    const token = localStorage.getItem("token");
    
    if (!amount || amount <= 0) {
        showToast("Please enter a valid amount", "error");
        return;
    }

    try {
        let response = await fetch(API_URL + "new_transaction/", {
            method: "POST",
            headers: {
                "Authorization": "Token " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: description,
                sender_bank_account_id: "outside",
                sender_user_id: localStorage.getItem("user_id"),
                receiver_bank_account_id: org_id,
                amount: amount
            })
        })
        let data = await response.json();
        if (response.status == 200){
            showToast("Transaction successful", "success");
            load_organization();
        }
        else{
            showToast(data.error || "Transaction failed", "error");
        }
    }
    catch (error) {
        console.error("Error:", error);
        showToast("An error occurred while processing the transaction", "error");
    }
}

function showToast(message, type) {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(toastContainer);
    }
    const toast = document.createElement("div");
    toast.style.cssText = `
        background: ${type === "success" ? "#04e22c" : "#e40101"};
        color: ${type === "success" ? "#3caa66" : "#922020"};
        padding: 10px 20px;
        margin-bottom: 10px;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 5px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}
document.getElementById("donate-btn").addEventListener("click", function() {
    document.getElementById("add-transaction-modal").classList.add("show");
})
document.getElementById("create-transaction").addEventListener("click", function() {
    document.getElementById("add-transaction-modal").classList.remove("show");
    new_transaction();
})
document.querySelectorAll('.close-modal, .btn-cancel').forEach(btn => {
    btn.addEventListener("click", function() {
        document.getElementById("add-transaction-modal").classList.remove("show");
    });
});
window.addEventListener("click", function(e) {
    const modal = document.getElementById("add-transaction-modal");
    if (e.target === modal) {
        modal.classList.remove("show");
}
});
document.addEventListener("DOMContentLoaded", function() {
    load_organization();
    if (localStorage.getItem("user_id") != null){
        document.getElementById("logout-btn").addEventListener("click", logout);}
    else {
        document.getElementById("logout-btn").innerHTML = "Login"
        document.getElementById("logout-btn").addEventListener("click", function (){
            window.location.href = "../login/login.html"
        })}
    setupWithdraw(); // I want to sleep it's 4 am I WANT TO SLEEEEEEEEP
});
function setupWithdraw() {
    const withdrawBtn = document.getElementById("transfer-btn");
    if (!withdrawBtn) {
        console.error("Withdraw button not found");
        return;
    }
    const modal = document.getElementById("transfer-modal");
    if (!modal) {
        console.error("Transfer modal not found");
        return;}
    withdrawBtn.removeEventListener("click", setupWithdrawClick);
    function setupWithdrawClick() {
        const titleInput = document.getElementById("transfer-title");
        const amountInput = document.getElementById("withdraw-amount");
        if (titleInput) titleInput.value = "";
        if (amountInput) amountInput.value = "";
        modal.classList.add("show");
    }
    withdrawBtn.addEventListener("click", setupWithdrawClick);
    const confirmBtn = document.getElementById("confirm-withdraw");
    if (confirmBtn) {
        confirmBtn.removeEventListener("click", performWithdrawal);
        confirmBtn.addEventListener("click", performWithdrawal);
    }
    document.querySelectorAll(".close-withdraw-modal, .close-transfer-modal").forEach(btn => {
        btn.removeEventListener("click", closeModal);
        function closeModal() {
            modal.classList.remove("show");
        }
        btn.addEventListener("click", closeModal);
    });
    window.removeEventListener("click", outsideClick);
    function outsideClick(e) {
        if (e.target === modal) {
            modal.classList.remove("show");
        }
    }
    window.addEventListener("click", outsideClick);
}
async function performWithdrawal() {
    const title = document.getElementById("transfer-title").value;
    const amount = parseFloat(document.getElementById("withdraw-amount").value);
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");
    const urlParams = new URLSearchParams(window.location.search);
    const org_id = urlParams.get("org_id");
    if (!title) {
        showToast("Please enter a title", "error");
        return;
    }
    if (!amount || amount <= 0) {
        showToast("Please enter a valid amount", "error");
        return;
    }
    try {
        let response = await fetch(API_URL + "new_transaction/", {
            method: "POST",
            headers: {
                "Authorization": "Token " + token,
                "Content-Type": "application/json"
},
            body: JSON.stringify({
                title: title,
                sender_bank_account_id: org_id,
                sender_user_id: user_id,
                receiver_bank_account_id: "outside",
                amount: amount
            })
        });
        let data = await response.json();
        if (response.status == 200) {
            showToast("Withdrawal successful", "success");
            load_organization();
            document.getElementById("transfer-title").value = "";
            document.getElementById("withdraw-amount").value = "";
            document.getElementById("transfer-modal").classList.remove("show");
        } else {
            showToast(data.error || "Withdrawal failed", "error");
        }
    } catch (error) {
        console.error("Withdrawal error:", error);
        showToast("Connection error", "error");
    }
}

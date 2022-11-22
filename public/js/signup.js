document.getElementById("signup_button_signup").addEventListener("click",()=>{
    setFormMessage(signup,"succed","Hellall LAANN!")
})

function setFormMessage(formElement, type, message){
    const messageElement = formElement.querySelector("#form_message");
    messageElement.textContent=message;
}
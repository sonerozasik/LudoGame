const sock=io();


const writeEvent = (text) =>{
    const element = document.getElementById("Message");
    element.innerHTML = text;
};
sock.on('message', writeEvent);
document.addEventListener("DOMContentLoaded",()=>{
    const loginForm=document.querySelector("#login");
    const signupForm=document.querySelector("#signup");

    loginForm.addEventListener("submit",e=>{

        setFormMessage(login,"success","Logged In !");
        
        })
})




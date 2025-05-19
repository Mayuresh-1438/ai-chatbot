let prompt=document.querySelector("#prompt")
let submitbtn=document.querySelector("#submit")
let chatContainer=document.querySelector(".chat-container")
let imagebtn=document.querySelector("#image")
let image=document.querySelector("#image img")
let imageinput=document.querySelector("#image input")

const Api_Url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBmyvCvvVjHG2QIAPD9vhTXUTshiHj4KcE"

window.addEventListener("DOMContentLoaded", ()=>{
    const isMobile = /Android | iPhone | iPad | iPod/i.test(navigator.userAgent);
    if (isMobile && window.innerWidth < 768){
        alert("For better experience, please open this site in desktop mode");
    }

     document.getElementById("image").addEventListener("click", () => {
        document.getElementById("imageInput").click();
    });

    document.getElementById("imageInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if(file && file.type.startswith("image/*")){
            handleImageUpload(file);
        }
        else{
            alert("Please select a valid image.");
        }
    });
});

let user={
    message:null,
    file:{
        mime_type:null,
        data: null
    }
}
 
async function generateResponse(aiChatBox) {

let text=aiChatBox.querySelector(".ai-chat-area")
    let RequestOption={
        method:"POST",
        headers:{'Content-Type' : 'application/json'},
        body:JSON.stringify({
            "contents":[
                {"parts":[{text:user.message},(user.file.data?[{inline_data:user.file}]:[])

                ]
            }]
        })
    }
    try{
        let response= await fetch(Api_Url,RequestOption)
        let data=await response.json()
       let apiResponse=data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim()
       text.innerHTML=apiResponse.replace(/\n/g, "<br>");  
       speakText(apiResponse);
    }
    catch(error){
        console.log(error);
        
    }
    finally{
        chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})
        image.src=`img.svg`
        image.classList.remove("choose")
        user.file={}
    }
    saveChatToLocalStorage();
}



function createChatBox(html,classes){
    let div=document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}


function handlechatResponse(userMessage){
    user.message=userMessage
    let html=`<img src="user.png" alt="" id="userImage" width="8%">
<div class="user-chat-area">
${user.message}
${user.file.data?`<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
</div>`
prompt.value=""
let userChatBox=createChatBox(html,"user-chat-box")
chatContainer.appendChild(userChatBox)

chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})

setTimeout(()=>{
let html=`<img src="ai.png" alt="" id="aiImage" width="10%">
    <div class="ai-chat-area">
    <img src="loading.webp" alt="" class="load" width="50px">
    </div>`
    let aiChatBox=createChatBox(html,"ai-chat-box")
    chatContainer.appendChild(aiChatBox)
    generateResponse(aiChatBox)
    
},600)

}


prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
       handlechatResponse(prompt.value)

    }
})

submitbtn.addEventListener("click",()=>{
    handlechatResponse(prompt.value)
})
imageinput.addEventListener("change",()=>{
    const file=imageinput.files[0]
    if(!file) return
    let reader=new FileReader()
    reader.onload=(e)=>{
       let base64string=e.target.result.split(",")[1]
       user.file={
        mime_type:file.type,
        data: base64string
    }
    image.src=`data:${user.file.mime_type};base64,${user.file.data}`
    image.classList.add("choose")
    }
    
    reader.readAsDataURL(file)
})


imagebtn.addEventListener("click",()=>{
    imagebtn.querySelector("input").click()
})
const voiceBtn = document.querySelector("#voice");

const SpeechRecognition = window.SpeechRecoginiton || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    voiceBtn.addEventListener("click",()=> {
        recognition.start();
        voiceBtn.classList.add("listening");
    });

    recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        prompt.value = speechToText;

        handlechatResponse(speechToText);
        voiceBtn.classList.remove("listening");
    };
    recognition.onerror = (event) =>
    {
        console.error("Speech recognition error :", event.error);
        voiceBtn.classList.remove("listening");
    };
    recognition.onend = () => {
        voiceBtn.classList.remove("listening");
    };
}
else{
    voiceBtn.disabled = true;
    voiceBtn.title = "Speech recogniton not supported in this browser."
}

function saveChatToLocalStorage() {
    const chats = document.querySelector(".chat-container").innerHTML;

    localStorage.setItem("chatHistory",chats);
}

window.addEventListener("load",()=> {
    const chatHistory = localStorage.getItem("chatHistory");
    if(chatHistory){
        document.querySelector(".chat-container").innerHTML = chatHistory;
    }
});

document.getElementById("clearChat").addEventListener("click", () => {
    localStorage.removeItem("chatHistory");
    document.querySelector(".chat-container").innerHTML = "";
    speechSynthesis.cancel()
    const voiceBtn = document.getElementById("voiceControlBtn");
    if(voiceBtn)
    voiceBtn.style.display = "none";
});

let currentUtterance = null;
function speakText(text){
    if(!text) return;

    speechSynthesis.cancel();
    currentUtterance= new SpeechSynthesisUtterance(text);
    currentUtterance.lang= "en-US";
    currentUtterance.rate="1";
    currentUtterance.pitch="1";
    speechSynthesis.speak(currentUtterance);
    const voiceBtn = document.getElementById("voiceControlBtn");
    const voiceIcon = document.getElementById("voiceIcon");
     if(voiceBtn && voiceIcon){
    voiceBtn.style.display="inline";
    voiceIcon.src = "pause.svg";
    voiceIcon.alt = "Pause";
     }
    
     currentUtterance.onend = () => {
        if(voiceBtn){
       voiceBtn.style.display = "none";
        }
    };
}
window.addEventListener("DOMContentLoaded", () => {
    const voiceBtn = document.getElementById("voiceControlBtn");
    const voiceIcon = document.getElementById("voiceIcon");

    if(voiceBtn && voiceIcon){
    voiceBtn.addEventListener("click", () => {
    

    if(speechSynthesis.speaking && !speechSynthesis.paused){
        speechSynthesis.pause();
        voiceIcon.src = "play.svg"
        voiceIcon.alt = "Resume";
    }
    else if (speechSynthesis.paused){
        speechSynthesis.cancel();
        speakText(currentText);
        isPaused = false;
        voiceIcon.src="pause.svg";
        voiceIcon.alt="Pause";
    }
    });
}
});

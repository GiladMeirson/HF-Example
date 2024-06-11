const sentences = [
    "I find immense satisfaction in client-side development.",
    "The interactive nature of client-side development truly captivates me.",
    "I am passionate about creating intuitive user interfaces through client-side development.",
    "I love client-side development because it allows me to directly impact the user experience.",
    "The immediate feedback loop in client-side development is something I truly appreciate.",
    "I enjoy the challenge of optimizing performance in client-side development.",
    "The creativity involved in client-side development is truly inspiring to me.",
    "I love client-side development because it allows me to bring designs to life.",
    "The problem-solving aspect of client-side development is something I find very rewarding.",
    "I love client-side development because it keeps me on my toes with its ever-evolving technologies and techniques."
];
let myChart; // Keep a reference to the chart instance


async function queryTEXTGen(data,url) {
    //https://api-inference.huggingface.co/models/google/gemma-2b
	const response = await fetch(url,
		{
			headers: { Authorization: "Bearer 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",
            "Content-Type": "application/json"
            },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}



async function queryTEXTsim(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}


async function queryTextClassification(data) {
    // https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base
	const response = await fetch(
		"https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}



async function queryTEXTtoIMG(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/nitrosocke/Arcane-Diffusion",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
	return result;
}

const voiceToText=()=>{
   // Check if the browser supports the SpeechRecognition API
if ('webkitSpeechRecognition' in window) {
    var recognition = new webkitSpeechRecognition();
    document.getElementById("phWords").innerHTML='Listening...';
    recognition.continuous = true; // Enable continuous recognition
    recognition.interimResults = true; // Enable interim results
  
    recognition.onresult = function(event) {
      var transcript = '';
      document.getElementById("phWords").innerHTML='Converting...';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
          document.getElementById("phWords").innerHTML=transcript;
          document.getElementById("speakbtn").style.display='block';
        }
      }
      // Render the transcript in the HTML
        
      
    };
  
    recognition.start(); // Start voice recognition
  } else {
    console.log('Speech Recognition API not supported by this browser.');
  }
}


const textToVoice=(text)=>{
    var synth = window.speechSynthesis;

        var utterThis = new SpeechSynthesisUtterance(text);
        synth.speak(utterThis);
}


const text2Voice=()=>{
    const text = document.getElementById("phWords").innerHTML;
    textToVoice(text);

}
////////////////////////////////////////////////////////////////////////////////////////


const ClickTextGen=()=>{
    const modelApi = document.getElementById("modelIN").value;
    const userText = document.getElementById("userTextIN").value;
    document.getElementById("userTextIN").value='';
    document.getElementsByClassName('chat-container')[0].innerHTML+=
        `
            <div class="user-message">
                ${userText}
            </div>
        `;
    const data = {
        inputs: userText
    };
    const url = modelApi;
    queryTEXTGen(data,url).then((result) => {
        console.log(result);
        document.getElementsByClassName('chat-container')[0].innerHTML+=
        `
            <div class="bot-message">
                ${result[0].generated_text}
            </div>
        `;
    });
}


const home=()=>{
    location.href = "index.html";
}


const AddSentence=(index)=>{

    if (index>sentences.length) {
        console.error('Max sentences reached out of range');
        return false;
    }
    let str = `
    <h3>your first sentence</h3>
    <input type="text" id="testSentenceIN" value="I love client side development">
    <hr class="hr">
    <h3>sentence to compare:</h3>`;
    for (let i = 0; i < index; i++) {
        str+=`<input type="text" class="testSentencesClass" id="testSentenceIN${i}" value="${sentences[i]}">`;
        
    }
    str+=`<button onclick="AddSentence(${index+1})" type="button">+</button>
    <button onclick="compareSentences()" type="button">compare</button>`;

    document.getElementsByClassName('input-group')[0].innerHTML =str;

}


const compareSentences=()=>{
    const userText = document.getElementById("testSentenceIN").value;
    const sentences = document.getElementsByClassName('testSentencesClass');
    let stringsSentences = [];
    for (let i = 0; i < sentences.length; i++) {
        stringsSentences.push(sentences[i].value);
    }
    const data = {
        inputs: {
            source_sentence: userText,
            sentences: stringsSentences
        }
    };

    queryTEXTsim(data).then((response) => {
	    console.log(JSON.stringify(response));
        for (let i = 0; i < sentences.length; i++) {
            const input = sentences[i];
            input.style.backgroundColor = "lightgray";
            input.value+=` - ${parseFloat(response[i].toFixed(2))*100}%`;
            
        }
    });
}

const ClassifyText=()=>{
    const userText = document.getElementById("userTextIN").value;
    
    const data = {
        inputs: userText
    };
    try{

        queryTextClassification(data).then((response) => {
            console.log(response);
            console.log(JSON.stringify(response));
            RenderChart(response[0]);
            
        });
    }
    catch(e){
        console.error(e);
        setTimeout(() => {
        queryTextClassification(data).then((response) => {
            console.log(response);
            console.log(JSON.stringify(response));
            RenderChart(response[0]);
            
        })}, 1000);
    }

}

const RenderChart=(data)=>{
    if (myChart instanceof Chart) {
        myChart.destroy();
    }
    const labels = data.map((item)=>item.label);
    const Data = data.map((item)=>item.score);
    const ctx = document.getElementById('myChart').getContext('2d');
    const best4 = labels.slice(0,4);
    const best4Data = Data.slice(0,4);
    console.log(best4);
    console.log(best4Data);
    let barColors = ['rgba(255, 99, 132,0.8)','rgba(54, 162, 235,0.8)','rgba(255, 206, 86,0.8)','rgba(75, 252, 170,0.8)',];

    myChart=new Chart(ctx, {
        type: "pie",
        data: {
          labels: best4,
          datasets: [{
            backgroundColor: barColors,
            data: best4Data
          }]
        },
        options: {
          title: {
            display: true,
            text: "Emotion Classification"
          }
        }
      });


}







const RandomSen=()=>{
    let text = getRandomSentence();
    document.getElementById("userTextIN").value=text;
}


const TextToImage=()=>{
    const userText = document.getElementById("userText2ImageIN").value;
    document.getElementById('loader').style.display = 'block';
    const data = {
        inputs: userText
    };
    queryTEXTtoIMG(data).then((response) => {
        console.log(response);
        const blob = response;
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.src = url;
        document.getElementById('imgPH').appendChild(img);
        document.getElementById('loader').style.display = 'none';
    });
}








function getRandomSentence() {
    let sentences = {
        goodVibe: [
            "Today is a wonderful day!",
            "I'm feeling very positive about this.",
            "Everything is going great.",
            "I'm really happy with how things are going.",
            "I'm feeling on top of the world!",
            "I couldn't be happier with the results.",
            "I'm feeling really optimistic about the future.",
            "I'm so grateful for everything I have."
        ],
        badVibe: [
            "This is not going well.",
            "I'm not happy with this situation.",
            "Things could be better.",
            "I'm feeling down today.",
            "I'm not feeling great about this.",
            "I wish things were different.",
            "I'm feeling a bit under the weather.",
            "I'm not in a good place right now."
        ],
        angerVibe: [
            "This is so frustrating!",
            "I can't believe this is happening!",
            "I'm really angry about this.",
            "This is unacceptable!",
            "I'm so mad I could scream!",
            "I've never been so angry in my life!",
            "I can't stand this anymore!",
            "This is the last straw!"
        ]
    };

    let vibes = Object.keys(sentences);
    let randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
    let randomSentence = sentences[randomVibe][Math.floor(Math.random() * sentences[randomVibe].length)];

    return randomSentence;
}
const URL = "../model/";
let model, webcam;

async function init() {
  try {
    // Check if tmImage is defined
    if (typeof tmImage === 'undefined') {
      throw new Error('Teachable Machine library not loaded. Please ensure the library script is loaded before script.js');
    }

    model = await tmImage.load(
      URL + "model.json",
      URL + "metadata.json"
    );

    webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam").appendChild(webcam.canvas);
  } catch (error) {
    console.error('Initialization error:', error);
    document.getElementById("label").innerText = "Error: " + error.message;
  }
}

// Wait for libraries to load before initializing
function waitForLibraries() {
  if (typeof tmImage !== 'undefined' && typeof tf !== 'undefined') {
    init();
  } else {
    setTimeout(waitForLibraries, 100);
  }
}

document.addEventListener('DOMContentLoaded', waitForLibraries);

async function loop() {
  webcam.update();
  await predict();
  requestAnimationFrame(loop);
}

async function predict() {
  const predictions = await model.predict(webcam.canvas);
  predictions.sort((a, b) => b.probability - a.probability);

  const top = predictions[0];
  const percent = (top.probability * 100).toFixed(2);

  document.getElementById("label").innerText = top.className;
  document.getElementById("confidence").innerText = percent + "%";

  updateUI(top.className);
}

function updateUI(label) {
  document.body.className = "";

  const hint = document.getElementById("hint");

  if (label === "Plastic") {
    document.body.classList.add("plastic");
    hint.innerText = "ทิ้งลงถังขยะรีไซเคิล (สีเหลือง)";
  } else if (label === "Paper") {
    document.body.classList.add("paper");
    hint.innerText = "ทิ้งลงถังขยะรีไซเคิล";
  } else if (label === "Metal") {
    document.body.classList.add("metal");
    hint.innerText = "ทิ้งลงถังขยะโลหะ";
  }
}

// Function to show the spinner
// Function to show the spinner
function showSpinner() {
  const spinnerElement = document.querySelector('#spinner');
  spinnerElement.style.display = 'block';
}

// Function to hide the spinner
function hideSpinner() {
  const spinnerElement = document.querySelector('#spinner');
  spinnerElement.style.display = 'none';
}


// Function to handle webcam integration
// Function to handle webcam integration
async function setupWebcam() {
  const videoElement = document.getElementById('video');

  // Check if the browser supports getUserMedia
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      videoElement.srcObject = stream;

      // Wait for the video metadata to load
      await new Promise(resolve => {
        videoElement.onloadedmetadata = () => {
          resolve();
        };
      });

      // Set the canvas dimensions to match the video dimensions
      const videoTrack = stream.getVideoTracks()[0];
      const { width, height } = videoTrack.getSettings();
      videoElement.width = width;
      videoElement.height = height;
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  } else {
    console.error('getUserMedia is not supported');
  }
}


// Global variables
let model;

// Function to load the pre-trained model
async function loadModel() {
  showSpinner();
  try {
    // Load the model from Teachable Machine
    model = await tf.loadLayersModel('https://teachable-machine-backend.onrender.com/model.json');
    
    // Print model summary (optional)
    model.summary();
    hideSpinner();
  } catch (error) {
    hideSpinner();
    console.error('Error loading the model:', error);
  }
}

// Function to capture an image from the webcam
// Function to capture an image from the webcam
function captureImage() {
  // Access the video element
  const videoElement = document.getElementById('video');
  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 224; // Set the desired width for the input shape of the model
  canvas.height = 224; // Set the desired height for the input shape of the model

  // Calculate the scale factors for resizing
  const scaleWidth = videoWidth / canvas.width;
  const scaleHeight = videoHeight / canvas.height;

  // Draw the current video frame on the canvas with resizing
  const context = canvas.getContext('2d');
  context.drawImage(videoElement, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);

  // Get the resized image data from the canvas
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // Return the captured image data
  return imageData;
}


// Function to classify the captured image
async function classifyImage() {
  // Capture an image from the webcam
  const image = captureImage();
  
  // Preprocess the image before making predictions
  // Add any necessary preprocessing steps here if needed
  
  try {
    // Convert the image data to a TensorFlow.js tensor
    const tensor = tf.browser.fromPixels(image);
    
    // Normalize the image tensor
    const normalizedTensor = tensor.toFloat().div(tf.scalar(255));
    
    // Add an extra dimension to match the model's input shape
    const batchedTensor = normalizedTensor.expandDims();
    
    // Make predictions using the loaded model
    const predictions = await model.predict(batchedTensor);
    
    // Process the predictions (extract class label and probability)
    const { label, probability } = processPrediction(predictions);

     swal.fire({
      title: `${label} (${Math.round(probability * 100)}%)`,
      icon: "success",
      width:"30%",
      didClose: () => {
        window.location.reload();
      }
    });
    
    // Clean up
    tensor.dispose();
    normalizedTensor.dispose();
    batchedTensor.dispose();
    predictions.dispose();
    hideSpinner();
  } catch (error) {
    hideSpinner();
    console.error('Error classifying the image:', error);
  }
}

// Function to process the prediction and extract class label and probability
// Function to process the prediction and extract class label and probability
function processPrediction(predictions) {
  const classLabels = ['Object', 'No object']; // Customize labels as per your model
  const probabilities = Array.from(predictions.dataSync());
  const maxProbabilityIndex = probabilities.indexOf(Math.max(...probabilities));
  
  return {
    label: classLabels[maxProbabilityIndex],
    probability: probabilities[maxProbabilityIndex],
  };
}

// Attach the click event listener to the capture button
const captureButton = document.getElementById('capture-button');
captureButton.addEventListener('click', handleCaptureButtonClick);

// Function to handle the capture button click event
function handleCaptureButtonClick() {
  // Call the classifyImage function
   showSpinner();
  classifyImage();
}


// Call the setupWebcam function
setupWebcam();

// Call the loadModel function
loadModel();

const express = require('express');
const multer = require('multer');
const routes = require('./src/routes/index');
const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors());
const corsOptions = {
  origin: '*', // Set the allowed origin
  methods: ['GET', 'POST'], // Set the allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Set the allowed headers
  optionsSuccessStatus: 200, // Set the status code for successful CORS preflight requests
};

app.use(cors(corsOptions));

// Load the model
const loadModel = async () => {
  // await tf.loadLayersModel('path/to/your/model.json');
};

loadModel().catch((error) => {
  console.error('Error loading model:', error);
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname); // Appending extension
  },
});

const upload = multer({ storage: storage });

app.use('/', routes);

app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    // Access the uploaded image file using req.file
    const imagePath = req.file.path;

    // Preprocess the image using Sharp.
    await sharp(imagePath)
      // Perform any desired image manipulations here.
      .resize(800, 600)
      .toFile('processed-image.jpg');

    res.send({ message: 'Image processed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Image processing failed' });
  }
});

app.get('/predict', (req, res) => {
  const prediction = 0.8;
  if (prediction > 0.7) {
    return res.send({ data: 'Success', pneumonia: true });
  }
  res.send({ data: 'predict routes', pneumonia: false });
});

app.post('/api/predict', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;

  // Spawn a child process to run the model script
  const pythonProcess = spawn('python', ['path/to/your/model_script.py', imagePath]);

  // Handle the output from the child process
  pythonProcess.stdout.on('data', (data) => {
    const result = data.toString().trim(); // Extract the result from the output
    res.json({ result });
  });

  // Handle any errors that occur during the process
  pythonProcess.stderr.on('data', (err) => {
    console.error(err.toString());
    res.status(500).json({ error: 'An error occurred during prediction.' });
  });
});

app.listen(4000, () => {
  console.log('Server running at port 4000');
});

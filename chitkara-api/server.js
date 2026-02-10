import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// -------- HEALTH API ----------
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: process.env.CHITKARA_EMAIL
  });
});

// --------- MAIN POST /bfhl ----------
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || Object.keys(body).length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Invalid request structure"
      });
    }

    const key = Object.keys(body)[0];
    const value = body[key];

    let result;

    switch (key) {
      case "fibonacci":
        result = fibonacci(value);
        break;

      case "prime":
        result = value.filter(isPrime);
        break;

      case "lcm":
        result = value.reduce(lcm);
        break;

      case "hcf":
        result = value.reduce(hcf);
        break;

      case "AI":
        result = await aiResponse(value);
        break;

      default:
        return res.status(400).json({
          is_success: false,
          message: "Invalid key"
        });
    }

    res.status(200).json({
      is_success: true,
      official_email: process.env.CHITKARA_EMAIL,
      data: result
    });

  } catch (err) {
    res.status(500).json({
      is_success: false,
      message: "Server error"
    });
  }
});

// Functions
function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];

  const arr = [0, 1];
  for (let i = 2; i < n; i++) arr[i] = arr[i - 1] + arr[i - 2];
  return arr;
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function hcf(a, b) {
  return b === 0 ? a : hcf(b, a % b);
}

function lcm(a, b) {
  return (a * b) / hcf(a, b);
}


async function aiResponse(question) {
const url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
  process.env.GEMINI_API_KEY;

  const strictQuestion = question + "\nGive ONLY the one-word answer. No sentences.";

  const response = await axios.post(url, {
    contents: [
      {
        role: "user",
        parts: [{ text: strictQuestion }]
      }
    ]
  });

  const text =
    response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const clean = text
    .replace(/[^a-zA-Z ]/g, "") 
    .trim()
    .split(" ")[0]; 

  return clean;
}


// ----------- SERVER LISTEN ----------------
app.listen(3000, () => console.log("Server running on port 3000"));

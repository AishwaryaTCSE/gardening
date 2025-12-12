Gardening Guide & Planner

A beginner-friendly Gardening Guide and Planner built to help users learn plant care, maintain gardens, track plant growth, and explore gardening tips. The project provides structured information, images, and tools that make gardening easy for everyone—from beginners to hobbyists.

🌱 Features

Plant Dictionary: Browse plants with images, sunlight needs, watering schedule, soil type, and care tips.
Garden Planner: Add plants, track growth, set watering reminders, and maintain a personalized garden list.
Seasonal Tips: Monthly gardening suggestions based on weather and plant growth cycles.
Beginner Tutorials: Step-by-step lessons on soil preparation, composting, tools, and plant care.
Eco-Friendly Tips: Learn sustainable gardening practices like composting, recycling, and organic fertilizers.

Responsive UI: Works on mobile, tablet, and desktop.

📁 Project Structure
gardening-project/
│── public/
│── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── hooks/
│   └── App.jsx
│── package.json
│── README.md

🛠️ Tech Stack

React + Vite
CSS / TailwindCSS (optional)
JavaScript (ES6+)
Firebase / Local Storage (optional for saving data)

🚀 Getting Started
1. Clone the repository
git clone https://github.com/your-username/gardening-project.git
cd gardening-project

2. Install dependencies
npm install

3. Run the development server
npm run dev

🔑 Environment Setup (AI + Weather)
- AI (frontend-only, key is exposed; use for local/dev):
  - Create `.env.local` in the project root with:
    - `VITE_OPENAI_DIRECT=true`
    - `VITE_OPENAI_API_KEY=sk-your-key-here`
- Safer (if you add any backend/serverless proxy later):
  - Set `VITE_AI_PROXY=https://your-proxy.example.com/api/ai-chat`
- Weather (optional, otherwise demo weather is used):
  - `VITE_WEATHER_API_KEY=your-openweather-key`

📦 Build for Production
npm run build

🧩 Future Enhancements

AI-based plant disease detection

Weather API-based smart garden alerts

User authentication and cloud storage

Plant marketplace section

🤝 Contributing

Contributions are welcome!
Feel free to open an issue or submit a pull request.

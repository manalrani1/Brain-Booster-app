import React, { useState, useEffect, useRef } from "react";

function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

const categories = [
  { id: 9, name: "General Knowledge" },
  { id: 17, name: "Science & Nature" },
  { id: 23, name: "History" },
  { id: 21, name: "Sports" },
];

const difficulties = ["easy", "medium", "hard"];

export default function QuizApp() {
  const [category, setCategory] = useState(categories[0].id);
  const [difficulty, setDifficulty] = useState(difficulties[0]);
  const [questionData, setQuestionData] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(15);
  const [loading, setLoading] = useState(false);

  const [questionIndexByCategory, setQuestionIndexByCategory] = useState({});
  const [scoreByCategory, setScoreByCategory] = useState({});

  const timerRef = useRef(null);

  const currentQuestionIndex = questionIndexByCategory[category] ?? 0;
  const currentScore = scoreByCategory[category] ?? 0;

  useEffect(() => {
    async function fetchQuestion() {
      setLoading(true);
      setSelectedOption(null);
      setShowAnswer(false);
      setTimer(15);
      clearInterval(timerRef.current);

      try {
        const res = await fetch(
          `https://opentdb.com/api.php?amount=1&type=multiple&category=${category}&difficulty=${difficulty}`
        );
        const data = await res.json();
        const q = data.results[0];
        setQuestionData(q);

        const shuffledOptions = [...q.incorrect_answers, q.correct_answer]
          .map(decodeHtml)
          .sort(() => Math.random() - 0.5);

        setOptions(shuffledOptions);
      } catch (error) {
        alert("Failed to load question.");
      }
      setLoading(false);
    }

    if (currentQuestionIndex < 5) {
      fetchQuestion();
    } else {
      setQuestionData(null);
      setOptions([]);
    }
  }, [category, difficulty, currentQuestionIndex]);

  useEffect(() => {
    if (loading) return;

    if (timer === 0) {
      setShowAnswer(true);
      clearInterval(timerRef.current);
    }

    if (!showAnswer && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [timer, showAnswer, loading]);

  const handleOptionClick = (option) => {
    if (showAnswer) return;

    setSelectedOption(option);
    setShowAnswer(true);
    clearInterval(timerRef.current);

    if (option === decodeHtml(questionData.correct_answer)) {
      setScoreByCategory((prev) => ({
        ...prev,
        [category]: (prev[category] ?? 0) + 1,
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < 4) {
      setQuestionIndexByCategory((prev) => ({
        ...prev,
        [category]: currentQuestionIndex + 1,
      }));
    } else {
      setQuestionIndexByCategory((prev) => ({
        ...prev,
        [category]: 5,
      }));
    }
    setTimer(15);
    setShowAnswer(false);
    setSelectedOption(null);
  };

  const handleReset = () => {
    setScoreByCategory((prev) => ({
      ...prev,
      [category]: 0,
    }));
    setQuestionIndexByCategory((prev) => ({
      ...prev,
      [category]: 0,
    }));
    setTimer(15);
    setShowAnswer(false);
    setSelectedOption(null);
  };

  const passingScore = 3;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: 650,
        margin: "2rem auto",
        padding: "2rem",
        borderRadius: 12,
        background:
          "radial-gradient(circle, #3b3b98, #1e3799, #0f3460, #16213e, #1e3799)",
        color: "white",
        boxShadow: "0 8px 16px rgba(0,0,0,0.6)",
        position: "relative",
      }}
    >
      {/* Top-left info */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          fontSize: "0.9rem",
          fontWeight: "bold",
          color: "#ffd700",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "6px 12px",
          borderRadius: "8px",
          userSelect: "none",
        }}
      >
        Manal Rani FA21-BSCS-0024 <br /> DevOps Project
      </div>

      <h1 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        🧠 Knowledge Booster Quiz
      </h1>
      <p
        style={{
          textAlign: "center",
          fontStyle: "italic",
          marginBottom: "1.5rem",
          color: "#ffd700",
        }}
      >
        Each category has <b>5 questions</b> to test your knowledge!
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <select
          value={category}
          onChange={(e) => setCategory(Number(e.target.value))}
          style={{ padding: "0.5rem", borderRadius: 6, fontSize: "1rem" }}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: 6, fontSize: "1rem" }}
        >
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </option>
          ))}
        </select>

        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            alignSelf: "center",
            color: timer <= 5 ? "#ff6b6b" : "#ffffff",
            transition: "color 0.3s ease",
          }}
          aria-live="polite"
        >
          ⏳ {timer}s
        </div>
      </div>

      {currentQuestionIndex < 5 ? (
        <>
          {loading ? (
            <p style={{ textAlign: "center" }}>Loading question...</p>
          ) : (
            <>
              <h3
                style={{ minHeight: "80px", marginBottom: "1rem" }}
                key={questionData?.question}
              >
                {questionData && decodeHtml(questionData.question)}
              </h3>

              <div>
                {options.map((option, idx) => {
                  const isCorrect =
                    option === (questionData && decodeHtml(questionData.correct_answer));
                  const isSelected = option === selectedOption;

                  let bgColor = "#444";

                  if (showAnswer) {
                    if (isCorrect) bgColor = "#4caf50";
                    else if (isSelected) bgColor = "#f44336";
                    else bgColor = "#555";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(option)}
                      disabled={showAnswer}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px",
                        margin: "10px 0",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: bgColor,
                        color: "white",
                        fontSize: "1rem",
                        cursor: showAnswer ? "default" : "pointer",
                        textAlign: "left",
                        transition: "background-color 0.3s ease",
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {showAnswer && (
                <button
                  onClick={handleNext}
                  style={{
                    marginTop: 20,
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#2196f3",
                    color: "white",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  Next Question
                </button>
              )}
            </>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <h2>Your Score: {currentScore} / 5</h2>
          <h3>
            {currentScore >= passingScore
              ? "🎉 Congratulations! You passed this category."
              : "😔 You did not pass. Keep practicing!"}
          </h3>
          <button
            onClick={handleReset}
            style={{
              marginTop: 20,
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#2196f3",
              color: "white",
              fontSize: "1.1rem",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
